from collections import defaultdict
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Brq_model, CustomUser, Notification, Role, UserRole
import logging

logger = logging.getLogger(__name__)

batch_notifications = defaultdict(bool)

@receiver(post_save, sender=Brq_model)
def create_notification(sender, instance, created, **kwargs):
    if not created:  
        old_validated_by = instance._state.fields_cache.get('validated_by')
        new_validated_by = instance.validated_by
        
       
        if old_validated_by != new_validated_by:
            logger.info(f"create_notification signal triggered for BRQ {instance.id}, validated_by updated: {new_validated_by}")
        
            try:
                roles = new_validated_by.split(',')
                
                last_role = roles[-1].strip()  
                
                role_notification_mapping = {
                    'inj-ui': 'chef-dep-ui',
                    'chef-dep-ui': 'directeur-ui',
                    'directeur-ui': 'inj-rpc,chef-dep-rpc,dest_brq',
                    'inj-rpc': None,  
                    'chef-dep-rpc': 'directeur-rpc',
                    'directeur-rpc': 'vp',
                }
                if int(instance.clas_ai) < 3:
                    role_notification_mapping = {
                        'inj-ui': 'chef-dep-ui',
                        'chef-dep-ui': 'directeur-ui',
                        'directeur-ui': 'inj-rpc,chef-dep-rpc,brq_urgent,dest_brq',
                        'inj-rpc': None, 
                        'chef-dep-rpc': 'directeur-rpc',
                        'directeur-rpc': 'vp',
                    }

                
                roles_to_notify = role_notification_mapping.get(last_role)

                if roles_to_notify:
                    
                    roles_to_notify = roles_to_notify.split(',')

                    for role in roles_to_notify:
                        users_for_role = CustomUser.objects.filter(role__nom=role)
                        
                        for user in users_for_role:
                            if user.site == instance.site_ai or last_role in ["directeur-ui", "inj-rpc", "chef-dep-rpc", "directeur-rpc", "vp", "brq_urgent", "dest_brq"]:
                                if last_role in ["inj-rpc", "chef-dep-rpc", "directeur-rpc"]:
                                    # If batch notification is already sent, skip
                                    if not batch_notifications[last_role]:
                                        send_notification(user, instance, last_role)
                                        batch_notifications[last_role] = True
                                else:
                                    send_notification(user, instance, last_role)
                    
            except Role.DoesNotExist:
                logger.warning(f"One of the roles in {new_validated_by} does not exist.")
                
@receiver(post_save, sender=Brq_model)
def reset_batch_notifications(sender, instance, created, **kwargs):
    if created:
        batch_notifications['inj-rpc'] = False
        batch_notifications['chef-dep-rpc'] = False
        batch_notifications['directeur-rpc'] = False

def send_notification(validating_user, brq_instance, validating_for_role):
    logger.info(f"Sending notification to {validating_user.username} for role {validating_for_role}")

    if validating_for_role == 'inj-ui':
        message = f"A BRQ has been validated by INJ-UI and is awaiting your validation."
    elif validating_for_role == 'chef-dep-ui':
        message = f"A BRQ has been validated by chef-dep-ui and is awaiting your validation."
    elif validating_for_role == 'directeur-ui':
        message = f"A BRQ has been filled by {brq_instance.site_ai}"
    elif validating_for_role == 'inj-rpc':
        return
    elif validating_for_role == 'chef-dep-rpc':
        message = f"A BRQ has been validated by chef-dep-rpc and is awaiting your validation."
    elif validating_for_role == 'directeur-rpc':
        message = f"BRQ has been validated by directeur-rpc"
    elif validating_for_role == 'vp':
        message = f"A BRQ has been validated and is ready for your review."
    else:
        message = f"A BRQ has been updated and requires your attention."

    if message:
        try:
            Notification.objects.create(
                user=validating_user,
                message=message,
                brq=brq_instance
            )
        except Exception as e:
            logger.error(f"Error creating notification for user {validating_user.username}: {e}")
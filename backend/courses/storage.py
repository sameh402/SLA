from storages.backends.ftp import FTPStorage
from django.conf import settings
import urllib.parse

class HostingerVideoStorage(FTPStorage):
    def __init__(self, *args, **kwargs):
        host = getattr(settings, 'HOSTINGER_FTP_HOST', '')
        user = getattr(settings, 'HOSTINGER_FTP_USER', '')
        passwd = getattr(settings, 'HOSTINGER_FTP_PASSWORD', '')
        port = getattr(settings, 'HOSTINGER_FTP_PORT', 21)
        root = getattr(settings, 'HOSTINGER_FTP_ROOT', '/')
        
        # URL encode user and password to handle special characters like @
        safe_user = urllib.parse.quote(user)
        safe_passwd = urllib.parse.quote(passwd)
        
        kwargs['location'] = f"ftp://{safe_user}:{safe_passwd}@{host}:{port}{root}"
        kwargs['base_url'] = getattr(settings, 'HOSTINGER_BASE_URL', None)
        super().__init__(*args, **kwargs)

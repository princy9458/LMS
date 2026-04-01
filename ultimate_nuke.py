import os
import shutil
import stat

def make_writable(func, path, exc_info):
    if not os.access(path, os.W_OK):
        os.chmod(path, stat.S_IWUSR)
        func(path)
    else:
        raise

targets = [
    r'd:\Projects\lms-one\app\api\lms\courses\[courseId]',
    r'd:\Projects\lms-one\app\api\lms\enrollment\[courseId]',
    r'd:\Projects\lms-one\app\lms\learn\[courseId]'
]

for t in targets:
    if os.path.exists(t):
        print(f"Attempting to remove: {t}")
        try:
            shutil.rmtree(t, onerror=make_writable)
            print(f"Successfully removed {t}")
        except Exception as e:
            print(f"Failed to remove {t}: {e}")
            try:
                # Last ditch: try to rename to something without brackets
                import uuid
                new_name = t.replace('[courseId]', 'DELETE_ME_' + str(uuid.uuid4())[:8])
                print(f"Trying to rename to {new_name}")
                os.rename(t, new_name)
                print(f"Renamed {t} to {new_name}")
            except Exception as e2:
                print(f"Even rename failed: {e2}")
    else:
        print(f"Path not found: {t}")

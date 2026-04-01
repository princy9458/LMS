import os
import shutil
import stat
import uuid

base_path = r'd:\Projects\lms-one'

def force_delete(path):
    def handle_remove_read_only(func, path, exc):
        excvalue = exc[1]
        if func in (os.rmdir, os.remove, os.unlink) and excvalue.errno == errno.EACCES:
            os.chmod(path, stat.S_IRWXU| stat.S_IRWXG| stat.S_IRWXO) # 0777
            func(path)
        else:
            raise
            
    if os.path.exists(path):
        print(f"Force deleting: {path}")
        # Try rename first to break locks/handles if possible
        temp_path = os.path.join(os.path.dirname(path), f"del_{uuid.uuid4().hex}")
        try:
            os.rename(path, temp_path)
            shutil.rmtree(temp_path, ignore_errors=True)
            print(f"  Deleted successfully via rename.")
        except:
            shutil.rmtree(path, ignore_errors=True)
            print(f"  Deleted via direct rmtree.")

targets = [
    r'app\api\lms\courses\[courseId]',
    r'app\api\lms\enrollment\[courseId]',
    r'app\lms\learn\[courseId]',
    r'app\admin\courses\builder\[courseId]'
]

for t in targets:
    abs_t = os.path.join(base_path, t)
    if os.path.exists(abs_t):
        force_delete(abs_t)
    else:
        print(f"Path not found: {abs_t}")

print("Cleanup script finished.")

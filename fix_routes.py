import os
import shutil
from datetime import datetime

base_path = r'd:\Projects\lms-one'
targets = [
    'app/api/lms/courses/[courseId]',
    'app/api/lms/enrollment/[courseId]',
    'app/lms/learn/[courseId]'
]

timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

for rel_path in targets:
    abs_path = os.path.join(base_path, rel_path.replace('/', os.sep))
    if os.path.exists(abs_path):
        new_path = f"{abs_path}_OLD_{timestamp}"
        try:
            print(f"Renaming {abs_path} to {new_path}")
            os.rename(abs_path, new_path)
        except Exception as e:
            print(f"Failed to rename {abs_path}: {e}")
            try:
                print(f"Trying to delete {abs_path} instead...")
                shutil.rmtree(abs_path)
            except Exception as e2:
                print(f"Failed to delete {abs_path}: {e2}")
    else:
        print(f"Path does not exist: {abs_path}")

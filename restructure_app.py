import os
import shutil

base_path = r'd:\Projects\lms-one\app'
target_path = os.path.join(base_path, '[locale]')

if not os.path.exists(target_path):
    os.makedirs(target_path)
    print(f"Created {target_path}")

items_to_move = [
    'admin', 'career-paths', 'courses', 'dashboard', 
    'internships', 'jobs', 'lms', 'login', 'register',
    'page.tsx', 'layout.tsx'
]

for item in items_to_move:
    src = os.path.join(base_path, item)
    dst = os.path.join(target_path, item)
    if os.path.exists(src):
        try:
            shutil.move(src, dst)
            print(f"Moved {item} to {target_path}")
        except Exception as e:
            print(f"Error moving {item}: {e}")
    else:
        print(f"Item not found: {src}")

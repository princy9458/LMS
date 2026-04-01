import os
import shutil

base = r'd:\Projects\lms-one'
# Normalize paths for Windows
moves = [
    (r'app\api\lms\courses', ['[id]', 'route.js']),
    (r'app\api\lms\enrollment', ['[id]']),
    (r'app\lms\learn', ['[id]'])
]

for parent_rel, good_items in moves:
    parent_abs = os.path.join(base, parent_rel)
    if not os.path.exists(parent_abs):
        print(f"Parent {parent_abs} not found")
        continue
    
    parent_bkp = parent_abs + "_BKP"
    print(f"Renaming {parent_abs} to {parent_bkp}")
    try:
        # If backup already exists, delete it first
        if os.path.exists(parent_bkp):
            shutil.rmtree(parent_bkp)
        os.rename(parent_abs, parent_bkp)
    except Exception as e:
        print(f"Failed to rename parent {parent_abs}: {e}")
        continue
        
    os.makedirs(parent_abs, exist_ok=True)
    
    for item in good_items:
        old_item = os.path.join(parent_bkp, item)
        new_item = os.path.join(parent_abs, item)
        if os.path.exists(old_item):
            print(f"Moving {old_item} to {new_item}")
            try:
                shutil.move(old_item, new_item)
            except Exception as e:
                print(f"Failed to move {old_item}: {e}")
                
print("Operation finished. Please check results.")

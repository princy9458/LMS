import os
import shutil

base = r'd:\Projects\lms-one'

def merge_and_delete(parent_rel, from_slug, to_slug):
    parent_abs = os.path.join(base, parent_rel)
    from_abs = os.path.join(parent_abs, from_slug)
    to_abs = os.path.join(parent_abs, to_slug)

    if not os.path.exists(from_abs):
        print(f"Nothing to merge from: {from_abs}")
        return

    if not os.path.exists(to_abs):
        print(f"Creating missing target: {to_abs}")
        os.makedirs(to_abs, exist_ok=True)

    print(f"Merging {from_abs} into {to_abs}")
    
    for root, dirs, files in os.walk(from_abs):
        rel_root = os.path.relpath(root, from_abs)
        target_root = os.path.join(to_abs, rel_root)
        
        if not os.path.exists(target_root):
            os.makedirs(target_root, exist_ok=True)
            
        for f in files:
            src_file = os.path.join(root, f)
            dest_file = os.path.join(target_root, f)
            if not os.path.exists(dest_file):
                print(f"Copying {src_file} to {dest_file}")
                shutil.copy2(src_file, dest_file)
            else:
                print(f"Skipping existing file: {dest_file}")

    print(f"Deleting conflicting source: {from_abs}")
    try:
        shutil.rmtree(from_abs)
    except Exception as e:
        print(f"Failed to delete {from_abs}: {e}")
        # Try a rename to get it out of the way
        try:
            os.rename(from_abs, from_abs + "_DELETEME")
            print(f"Renamed {from_abs} to {from_abs}_DELETEME")
        except:
            pass

# Locations to fix
merge_and_delete(r'app\api\lms\courses', '[courseId]', '[id]')
merge_and_delete(r'app\api\lms\enrollment', '[courseId]', '[id]')
merge_and_delete(r'app\lms\learn', '[courseId]', '[id]')

print("Merge completed.")

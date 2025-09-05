#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
from typing import List, Tuple


FUNCTION_DEF_RE = re.compile(r"^(\s*)function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*{\s*$")
ARROW_DEF_RE = re.compile(r"^(\s*)(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*{\s*$")


def has_note_above(lines: List[str], index: int) -> bool:
    # Look up a few non-empty lines directly above for an existing comment or note
    i = index - 1
    empty_seen = 0
    while i >= 0 and empty_seen < 5:
        line = lines[i].rstrip("\n")
        if line.strip() == "":
            empty_seen += 1
            i -= 1
            continue
        stripped = line.lstrip()
        # If there's already a block or single-line comment, assume documented
        if stripped.startswith("/**") or stripped.startswith("/*") or stripped.startswith("//"):
            return True
        # Stop if we hit any other code
        return False
    return False


def build_note(indent: str, name: str, params: str) -> List[str]:
    params_clean = params.strip()
    params_text = params_clean if params_clean else "بدون"
    note_lines = [
        f"{indent}/**",
        f"{indent} * ملاحظة: الدالة {name} — وصف تلقائي موجز لوظيفتها.",
        f"{indent} * المدخلات: {params_text}",
        f"{indent} * المخرجات: راجع التنفيذ",
        f"{indent} */",
    ]
    return [l + "\n" for l in note_lines]


def annotate_file(path: str) -> Tuple[int, int]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"تخطي {path}: {e}")
        return 0, 0

    additions = 0
    i = 0
    out: List[str] = []

    while i < len(lines):
        line = lines[i]
        m = FUNCTION_DEF_RE.match(line)
        a = ARROW_DEF_RE.match(line)
        if m or a:
            indent, name, params = (m or a).groups()
            if not has_note_above(out if i == 0 else out + [], len(out)):
                out.extend(build_note(indent, name, params))
                additions += 1
            out.append(line)
            i += 1
            continue

        out.append(line)
        i += 1

    if additions > 0:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(out)
    return additions, len(lines)


def main():
    target_files: List[str] = []
    # Collect JS files from js directory
    js_root = "/workspace/js"
    if os.path.isdir(js_root):
        for name in os.listdir(js_root):
            if name.endswith(".js"):
                target_files.append(os.path.join(js_root, name))
    # Add root-level JS files if present
    for name in ("/workspace/app.js", "/workspace/serviceworker.js"):
        if os.path.isfile(name):
            target_files.append(name)

    total_added = 0
    processed = 0
    for fp in sorted(target_files):
        added, _ = annotate_file(fp)
        processed += 1
        total_added += added
        if added:
            print(f"[تمت الإضافة] {added} ملاحظات في: {os.path.basename(fp)}")
    print(f"الملفات المعالجة: {processed}, إجمالي الملاحظات المضافة: {total_added}")


if __name__ == "__main__":
    main()


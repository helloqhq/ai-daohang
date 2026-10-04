#!/usr/bin/env python3
"""Validate one local snapshot and copy only public assets to Pages output."""
import shutil
import subprocess
from pathlib import Path
from collector.pipeline import Pipeline

root=Path(__file__).resolve().parents[1]
result=Pipeline(root).validate()
destination=root/'dist'
if destination.exists():
    shutil.rmtree(destination)
shutil.copytree(root/'public',destination)
subprocess.run(['node',str(root/'scripts/prerender.mjs'),str(destination)],check=True)
(destination/'.nojekyll').touch()
print(f"构建完成：{result['events']} 条事件 → dist/（仅公开文件）")

import importlib
from pathlib import Path

import pandas as pd

tasks = importlib.import_module("app.workers.tasks")


def test_load_dataframe_csv(tmp_path: Path):
    p = tmp_path / "sample.csv"
    pd.DataFrame({"a": [1, 2], "b": [3, 4]}).to_csv(p, index=False)
    df = tasks._load_dataframe(p)
    assert list(df.columns) == ["a", "b"]
    assert len(df) == 2


def test_load_dataframe_xlsx(tmp_path: Path):
    p = tmp_path / "sample.xlsx"
    pd.DataFrame({"a": [1], "b": [2]}).to_excel(p, index=False)
    df = tasks._load_dataframe(p)
    assert list(df.columns) == ["a", "b"]
    assert len(df) == 1


def test_load_dataframe_unsupported_extension(tmp_path: Path):
    p = tmp_path / "sample.txt"
    p.write_text("hello")
    try:
        tasks._load_dataframe(p)
        assert False, "Expected ValueError for unsupported extension "
    except ValueError as e:
        assert "Unsupported file type" in str(e)

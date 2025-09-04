import importlib

import pandas as pd

tasks = importlib.import_module("app.workers.tasks")


def test_normalize_keeps_only_canon_and_cleans_fields():
    raw = pd.DataFrame(
        {
            "title": ["  Sr Dev  ", "  "],
            "salary": ["10000", "abc"],  # segunda vira NaN e cai fora
            "currency": ["", None],  # vira USD
            "country": [" BR ", "US "],
            "seniority": [" Senior ", "Junior "],
            "stack": [" Python ", " JS "],
            "ignored": [1, 2],
        }
    )
    df = tasks._normalize(raw)

    # CANON only
    assert set(df.columns).issubset(set(tasks.CANON))
    # invalid row was dropped
    assert len(df) == 1

    row = df.iloc[0].to_dict()
    assert row["title"] == "Sr Dev"
    assert row["salary"] == 10000
    assert row["currency"] == "USD"
    assert row["country"] == "BR"
    assert row["seniority"] == "Senior"
    assert row["stack"] == "Python"

#!/bin/bash

# Run using a custom environment file.
# Sample usage: ./run .env python sample_app.py

env $(cat $1 | xargs) ${@:2}

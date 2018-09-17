#!/usr/bin/env python
# -*- coding: utf-8 -*-
import math

ROUND_DIGIT = 10

def cos(deg):
    return round(math.cos(math.radians(deg)) , ROUND_DIGIT)

def sin(deg):
    return round(math.sin(math.radians(deg)), ROUND_DIGIT)

def add_entity(entity_list, entity_obj):
    if entity_obj is not None:
        entity_list.append(entity_obj)


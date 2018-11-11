#!/usr/bin/env python
# -*- coding: utf-8 -*-
import math
import numpy

ROUND_DIGIT = 10

def cos(deg):
    return round(math.cos(math.radians(deg)) , ROUND_DIGIT)

def sin(deg):
    return round(math.sin(math.radians(deg)), ROUND_DIGIT)

def add_entity(entity_list, entity_obj):
    if entity_obj is not None:
        entity_list.append(entity_obj)

def log_obj(entity_list):
    for e in entity_list:
        print(e.__class__.__name__ + ":" + str(e.__dict__))

def log_point(point_list):
    for p in point_list:
        print(p)

def calc_distance(point_1, point_2):
    point_u = point_1 - point_2
    return numpy.linalg.norm(point_u)


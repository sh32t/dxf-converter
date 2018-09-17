#!/usr/bin/env python
# -*- coding: utf-8 -*-
from abc import ABCMeta, abstractmethod
import mylib
import numpy
import math
import copy

class Entity(object):
    def __init__(self):
        self.s_point = numpy.array([0, 0])
        self.e_point = numpy.array([0, 0])

    @abstractmethod
    def set_value(self, dxf_data):
        pass

    def set_start_x(self, x):
        self.s_point[0] = x

    def set_start_y(self, y):
        self.s_point[1] = y

    def set_end_x(self, x):
        self.e_point[0] = x

    def set_end_y(self, y):
        self.e_point[1] = y

class Line(Entity):
    # グループコード
    START_X = '10'
    START_Y = '20'
    END_X = '11'
    END_Y = '21'

    def set_value(self, dxf_data):
        if dxf_data[0] == self.START_X:
            self.set_start_x(float(dxf_data[1]))

        elif dxf_data[0] == self.START_Y:
            self.set_start_y(float(dxf_data[1]))

        elif dxf_data[0] == self.END_X:
            self.set_end_x(float(dxf_data[1]))

        elif dxf_data[0] == self.END_Y:
            self.set_end_y(float(dxf_data[1]))


class Arc(Entity):
    # グループコード
    CENTER_X = '10'
    CENTER_Y = '20'
    RADIUS = '40'
    START_ANGLE = '50'
    END_ANGLE = '51'

    def __init__(self):
        super(Arc, self).__init__()
        self.c_point = numpy.array([0, 0])
        self.radius = 0
        self.s_angle = 0
        self.e_angle = 0
        self.set_count = 0

    def add_set_count(self):
        self.set_count = self.set_count + 1

    def set_value(self, dxf_data):
        if dxf_data[0] == self.CENTER_X:
            self.c_point[0] = float(dxf_data[1])
            self.add_set_count()

        elif dxf_data[0] == self.CENTER_Y:
            self.c_point[1] = float(dxf_data[1])
            self.add_set_count()

        elif dxf_data[0] == self.RADIUS:
            self.radius = float(dxf_data[1])
            self.add_set_count()

        elif dxf_data[0] == self.START_ANGLE:
            self.s_angle = float(dxf_data[1])
            self.add_set_count()

        elif dxf_data[0] == self.END_ANGLE:
            self.e_angle = float(dxf_data[1])
            self.add_set_count()

        if self.set_count == 5:
            start_x = self.c_point[0] + self.radius *  mylib.cos(self.s_angle)
            start_y = self.c_point[1] + self.radius *  mylib.sin(self.s_angle)
            end_x = self.c_point[0] + self.radius *  mylib.cos(self.e_angle)
            end_y = self.c_point[1] + self.radius *  mylib.sin(self.e_angle)

            self.set_start_x(start_x)
            self.set_start_y(start_y)
            self.set_end_x(end_x)
            self.set_end_y(end_y)

class Circle(Entity):
    def set_value(self, dxf_data):
        print("")

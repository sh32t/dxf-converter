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

    @abstractmethod
    def exchange(self):
        pass

    @abstractmethod
    def divide(self):
        pass

    @abstractmethod
    def length(self):
        pass

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

    def exchange(self):
        tmp = self.s_point
        self.s_point = self.e_point
        self.e_point = tmp

    def divide(self, interval):
        point_list = []
        div_num = int(self.length() / interval)
        len_x = (self.e_point[0] - self.s_point[0]) / div_num
        len_y = (self.e_point[1] - self.s_point[1]) / div_num
        for i in range(div_num):
            point_x = self.s_point[0] + len_x * i
            point_y = self.s_point[1] + len_y * i
            point_list.append(numpy.array([point_x, point_y]))

        return point_list

    def length(self):
        return mylib.calc_distance(self.s_point, self.e_point)

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

        # パラメーターが揃ったら始点、終点を計算
        if self.set_count == 5:
            self.calc_arc_point()
            # デバッグ表示を回避
            del self.set_count

    def exchange(self):
        tmp = self.s_angle
        self.s_angle = self.e_angle
        self.e_angle = tmp
        self.calc_arc_point()

    def divide(self, interval):
        point_list = []
        div_num = int(self.length() / interval)
        div_angle = numpy.absolute(self.e_angle - self.s_angle) / div_num

        for i in range(div_num):
            angle = self.s_angle + div_angle * i
            point_list.append(self.get_arc_point(self.c_point, self.radius, angle))

        return point_list

    def length(self):
        return 2 * self.radius * numpy.pi * (numpy.absolute(self.e_angle - self.s_angle) / 360)

    def calc_arc_point(self):
        start_x = self.c_point[0] + self.radius *  mylib.cos(self.s_angle)
        start_y = self.c_point[1] + self.radius *  mylib.sin(self.s_angle)
        end_x = self.c_point[0] + self.radius *  mylib.cos(self.e_angle)
        end_y = self.c_point[1] + self.radius *  mylib.sin(self.e_angle)
        self.set_start_x(start_x)
        self.set_start_y(start_y)
        self.set_end_x(end_x)
        self.set_end_y(end_y)

    def get_arc_point(self, point, radius, angle):
        radian = math.radians(angle)
        cos = math.cos(radian)
        sin = math.sin(radian)
        x = point[0] + radius * cos
        y = point[1] + radius * sin
        return numpy.array([x, y])

# TODO 必要になったら実装
class Circle(Entity):
    def set_value(self, dxf_data):
        print("")

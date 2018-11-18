#!/usr/bin/env python
# -*- coding: utf-8 -*-
import mylib
import os
import sys
import json
import entity
import copy
import numpy

# 設定
test_flg = False
ratio = 1000

# ASCIIコードでエンコーディング
def ascii_encode_dict(data):
    ascii_encode = lambda x: x.encode('ascii') if isinstance(x, unicode) else x
    return dict(map(ascii_encode, pair) for pair in data.items())

# 設定値の取得
def get_setting(test_flg):
    arg = None
    if test_flg:
        arg = '{"angle":0,"file":"track.dxf","interval":0.05,"width":0.0775}'
    else:
        arg = sys.argv[1]
    setting = json.loads(arg, object_hook=ascii_encode_dict)
    return setting
    

# ファイルの読み込み
def read_file(file_name, test_flg):
    # ファイルを開く
    os_path = os.getcwd()
    dir_path = r'/src/file/dxf/'
    read_file= None
    if test_flg:
        read_file = open("../file/dxf/" + file_name)
    else:
        read_file = open(os_path + dir_path + file_name)

    # 一行ずつリスト型に格納
    text_list = list()
    for line in read_file:
        line = line.replace('\n', '')
        line = line.replace('\r', '')
        line = line.replace(' ', '')
        text_list.append(line)

    return text_list

# DXFファイルのデータをフォーマット
def format_dxf(text_list):

    dxf_list = list()
    for index in range(0, len(text_list), 2):

        # (グループコード, データ値)
        dxf_data = (text_list[index], text_list[index + 1])
        dxf_list.append(dxf_data)

        # (0, EOF)：読み取り完了
        if text_list[index] == '0' and text_list[index + 1] == 'EOF':
            break

    return dxf_list

# エンティティの抽出
def extract_entities(dxf_list):

    section_flg = False
    entity_flg = False

    SECTION = ('0', 'SECTION')
    ENDSEC = ('0', 'ENDSEC')
    ENTITIES = ('2', 'ENTITIES')
    LINE = ('0', 'LINE')
    ARC = ('0', 'ARC')
    CIRCLE = ('0', 'CIRCLE')

    entity_list = list()
    entity_obj = None
    for dxf_data in dxf_list:

        if dxf_data == SECTION:
            section_flg = True
        elif dxf_data == ENTITIES:
            entity_flg = True

        if section_flg and entity_flg:
            # 線分
            if dxf_data == LINE:
                mylib.add_entity(entity_list, entity_obj)
                entity_obj = entity.Line()
            # 円弧
            elif dxf_data == ARC:
                mylib.add_entity(entity_list, entity_obj)
                entity_obj = entity.Arc()
            # 円
            elif dxf_data == CIRCLE:
                mylib.add_entity(entity_list, entity_obj)
            # セクション終了
            elif dxf_data == ENDSEC:
                mylib.add_entity(entity_list, entity_obj)
                section_flg = False
                entity_flg = False
            # 空白
            elif entity_obj is not None:
                entity_obj.set_value(dxf_data)

    return entity_list

# エンティティのソート
def sort_entities(entity_list):

    new_entity_list = []
    
    # 一つ目のエンティティを決定
    first_entity = entity_list.pop(0)
    new_entity_list.append(first_entity)

    last_point = first_entity.e_point
    while len(entity_list) > 0:
        last_distance = None
        pop_index = None
        i = 0
        for entity in entity_list:
            # 始点と比較
            next_point = entity.s_point
            next_distance = mylib.calc_distance(last_point, next_point)
            if last_distance == None or next_distance < last_distance:
                last_distance = next_distance
                pop_index = i

            # 終点と比較
            next_point = entity.e_point
            next_distance = mylib.calc_distance(last_point, next_point)
            if next_distance < last_distance:
                last_distance = next_distance
                pop_index = i
                entity.exchange()

            i += 1

        last_entity = entity_list.pop(pop_index)
        last_point = last_entity.e_point
        new_entity_list.append(last_entity)

    return new_entity_list

# 分割数の計算
def div_num_entities(entity_list, interval):
    for entity in entity_list:
        entity.set_div_num(interval)


# 座標の分割
def divide_entities(entity_list):
    point_list = []
    for entity in entity_list:
        point_list.extend(entity.divide())
    return point_list

# ノズル経路の取得
def get_nozzle_path(entity_list, line_distance):
    nozzle_entity_list = copy.deepcopy(entity_list)
    s_point = None
    for nozzle_entity in nozzle_entity_list:
        nozzle_entity.nozzle_path_arc(line_distance)
        s_point = nozzle_entity.e_point

    i = 0
    for nozzle_entity in nozzle_entity_list:
        if i < len(nozzle_entity_list) - 1:
            e_point = nozzle_entity_list[i + 1].s_point
            nozzle_entity.nozzle_path_line(s_point, e_point)
            s_point = nozzle_entity_list[i].e_point
        else:
            e_point = nozzle_entity_list[0].s_point
            nozzle_entity.nozzle_path_line(s_point, e_point)

        i += 1

    return nozzle_entity_list

# ファイル出力
def export_data(point_list, file_name):
    point_dict = {}
    i = 0
    for point in point_list:
        point_dict[i] = [point[0], point[1]]
        i += 1

    path = 'src/file/' + file_name
    with open(path, mode='w') as file:
        file.write(json.dumps(point_dict))


# 設定値を取得
setting = get_setting(test_flg)

# ファイルの読み込み
file_name = setting['file']
text_list = read_file(file_name, test_flg)

# DXFデータにフォーマット
dxf_list = format_dxf(text_list)

# データの解析
print("### extract ###")
entity_list = extract_entities(dxf_list)
mylib.log_obj(entity_list)

# エンティティのソート
print("### sort ###")
entity_list = sort_entities(entity_list)
mylib.log_obj(entity_list)

# 分割数の計算
interval = setting["interval"] * ratio
div_num_entities(entity_list, interval)

# ノズル経路の取得
print("### nozzle_path ###")
line_distance = setting["width"] * ratio
entity_list_out = get_nozzle_path(entity_list, line_distance)
entity_list_in = get_nozzle_path(entity_list, -line_distance)
mylib.log_obj(entity_list_out)
mylib.log_obj(entity_list_in)

# 座標の分割
print("### divide ###")
angle = setting["angle"]
point_list = divide_entities(entity_list)
point_list_out = divide_entities(entity_list_out)
point_list_in = divide_entities(entity_list_in)
mylib.log_point(point_list)

# データ出力
print("### export ###")
export_data(point_list, "center.json")
export_data(point_list_out, "out.json")
export_data(point_list_in, "in.json")

print("### completed ###")

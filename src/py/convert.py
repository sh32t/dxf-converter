#!/usr/bin/env python
# -*- coding: utf-8 -*-
import mylib
import os
import sys
import json
import entity
import copy

# ASCIIコードでエンコーディング
def ascii_encode_dict(data):
    ascii_encode = lambda x: x.encode('ascii') if isinstance(x, unicode) else x
    return dict(map(ascii_encode, pair) for pair in data.items())

# 設定値の取得
def get_setting():
    setting = json.loads(sys.argv[1], object_hook=ascii_encode_dict)
    return setting

# ファイルの読み込み
def read_file(file_name):
    # ファイルを開く
    os_path = os.getcwd()
    dir_path = r'/src/file/dxf/'
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
            if dxf_data == LINE:
                mylib.add_entity(entity_list, entity_obj)
                entity_obj = entity.Line()

            elif dxf_data == ARC:
                mylib.add_entity(entity_list, entity_obj)
                entity_obj = entity.Arc()

            elif dxf_data == CIRCLE:
                mylib.add_entity(entity_list, entity_obj)

            elif dxf_data == ENDSEC:
                mylib.add_entity(entity_list, entity_obj)
                section_flg = False
                entity_flg = False

            elif entity_obj is not None:
                entity_obj.set_value(dxf_data)

    return entity_list


# 設定値を取得
setting = get_setting()

# ファイルの読み込み
file_name = setting['file']
text_list = read_file(file_name)

# DXFデータにフォーマット
dxf_list = format_dxf(text_list)

# データの解析
entity_list = extract_entities(dxf_list)
for e in entity_list:
    print(e.s_point)
    print(e.e_point)

# データの変換
interval = setting['interval']
width = setting['width']
angle = setting['angle']

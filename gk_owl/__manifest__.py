# -*- coding: utf-8 -*-
{
    'name': 'OWL Test',
    'version': '16.0.1.0.0',
    'summary': '',
    'category': 'Technical',
    'author': 'BIO',
    'depends': ['product'],
    'data': ['views/todo_list.xml',
             'security/ir.model.access.csv',],
    'assets': {
        'web.assets_backend': [
            'gk_owl/static/src/components/todo_list/todo_list.js',
            'gk_owl/static/src/components/todo_list/todo_list.scss',
            'gk_owl/static/src/components/todo_list/todo_list.xml',
        ],
    },
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}

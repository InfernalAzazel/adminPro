from pprint import pprint

from bson import ObjectId

interface_permission = [
            ObjectId("62c79bef76a04c01fd6d6561"),
            ObjectId("62c79bef76a04c01fd6d6563"),
            ObjectId("62da5a0bdc655c5c2b15238c"),
            ObjectId("62c79bef76a04c01fd6d6565"),
            ObjectId("62c79bef76a04c01fd6d6564"),
            ObjectId("62da5ad3dc655c5c2b1523d4"),
            ObjectId("62da5c6ddc655c5c2b15246c")
        ]

# # 从interface_permission中提取所有"uid"的值
filtered_uids = [str(item) for item in interface_permission]

pprint(filtered_uids)


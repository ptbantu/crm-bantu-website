
1.线索的查询 负责人就是 owner 后端需要 owner的id 和ownner的名字 前端需要显示 成负责人名字
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "items": [
            {
                "id": "41a6c1f3-8dac-4714-9072-22ae336df1ce",
                "name": "印尼华友钴业建筑资质办理",
                "company_name": "印尼华友钴业",
                "contact_name": "韩经理",
                "phone": "17610598621",
                "email": null,
                "address": "印尼",
                "customer_id": null,
                "organization_id": "00000000-0000-0000-0000-000000000001",
                "owner_user_id": "72fafd73-338e-4d5a-ad47-a28d19f962c0",
                "status": "new",
                "level": "2",
                "is_in_public_pool": false,
                "pool_id": null,
                "moved_to_pool_at": null,
                "tianyancha_data": null,
                "tianyancha_synced_at": null,
                "last_follow_up_at": null,
                "next_follow_up_at": null,
                "created_by": "72fafd73-338e-4d5a-ad47-a28d19f962c0",
                "updated_by": null,
                "created_at": "2025-11-26T16:41:03",
                "updated_at": "2025-11-26T16:41:03",
                "level_name_zh": "央企总部和龙头企业",
                "level_name_id": "Perusahaan Pusat BUMN dan Perusahaan Terkemuka"
            }
        ],
        "total": 1,
        "page": 1,
        "size": 20
    },
    "timestamp": "2025-11-26T16:41:03.382400"
}

2. 操作有个button 转换可以将我的线索转给其他人 直接弹窗然后查询后台 和我一个组织的user 列表 直接update 

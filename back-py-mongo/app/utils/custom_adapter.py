from casbin import persist

from app.models.system.interface import InterfaceResponseModel
from app.models.system.role import RoleResponseModel


class Adapter(persist.Adapter):
    """Casbin适配器的接口"""

    def __init__(self, role_model: RoleResponseModel, interface_models: list[InterfaceResponseModel]):
        self.role_model = role_model
        self.interface_models = interface_models

    def load_policy(self, model):
        """
        实现 casbin 的 add 接口
        从 mongodb 加载所有策略规则
        """
        # print('init load_policy')
        if not self.role_model.model_dump():
            # print('No role found')
            return

        for interface_model in self.interface_models:
            line = f'p, {self.role_model.uid}, {interface_model.path}, {interface_model.method}'
            persist.load_policy_line(line, model)
        if self.role_model.interface_permission:
            line = f'g, {self.role_model.name}, {self.role_model.uid}'
            persist.load_policy_line(line, model)
            # print('load policy success')

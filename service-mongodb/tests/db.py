
import fnmatch

# 测试文件名是否匹配通配符模式
is_match = fnmatch.fnmatch("linux-unpacked", "*linux*.*")
print(is_match)  #

import sys
import json


class Input():
    def __init__(self):
        self.inputs = json.loads(sys.stdin.readlines()[0])

    def apply_map(self, source, target, callback):
        self.inputs[target] = {}
        for key, value in self.inputs[source].items():
            if type(value) == list:
                self.inputs[target][key] = []
                for x in value:
                    self.inputs[target][key].append(callback(x))
            else:
                self.inputs[target][key] = callback(value)

    def get(self, key):
        return self.inputs[key]

    def update(self, key, value):
        self.inputs[key] = value

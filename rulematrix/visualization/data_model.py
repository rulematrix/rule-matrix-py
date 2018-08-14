"""
Visualizable Data Model
"""


class DataModel:

    def __init__(self, rule_list, target, dataset):
        self.rule_list = rule_list
        self.target = target
        self.dataset = dataset

    def _repr_html_(self):
        return ("""
            <div>
                <script type="text/javascript" src=''/>
                <div id="demo">
                </div>
            </div>    
            
        """)

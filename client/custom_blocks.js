Blockly.defineBlocksWithJsonArray([
  {
    "type": "defect",
    "message0": "Defect",
    "output": "defect",
    "colour": 230,
  },
  {
    "type": "cooperate",
    "message0": "Cooperate",
    "output": "cooperate",
    "colour": 60,
  },
  {
    "type": "if_last_move_cooperate",
    "message0": "If last move was cooperate %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MOVE",
        "check": ["defect", "cooperate"]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
  },
  {
    "type": "if_last_move_defect",
    "message0": "If last move was defect %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MOVE",
        "check": ["defect", "cooperate"]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
  },
  {
    "type": "first_move",
    "message0": "First move %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MOVE",
        "check": ["defect", "cooperate"]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 90,
  },
  {
    "type": "loop",
    "message0": "Loop %1",
    "args0": [
      {
        "type": "input_statement",
        "name": "STATEMENTS"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
  }
]);

Blockly.JavaScript['defect'] = function(block) {
  return ['"defect"', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['cooperate'] = function(block) {
  return ['"cooperate"', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['first_move'] = function(block) {
  var move = Blockly.JavaScript.valueToCode(block, 'MOVE', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'if (round === 0) { return ' + move + '; }';
  return code;
};

Blockly.JavaScript['loop'] = function(block) {
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  var code = 'if (round > 0) { ' + statements + ' }';
  return code;
};

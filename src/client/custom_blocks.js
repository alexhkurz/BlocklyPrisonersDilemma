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
    "colour": 230,
  },
  {
    "type": "if_last_move_cooperate",
    "message0": "If opponent did cooperate %1",
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
    "message0": "If opponent did defect %1",
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
    "type": "move",
    "message0": "if move %1 %2 %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "OPERATOR",
        "options": [
          ["==", "==="],
          ["<", "<"],
          [">", ">"],
          ["!=", "!==="]
        ]
      },
      {
        "type": "field_number",
        "name": "MOVE_NUMBER",
        "value": 0
      },
      {
        "type": "input_statement",
        "name": "STATEMENTS"
      }
    ],
    "inputStatement": {
        "name": "STATEMENTS"
    },
    "previousStatement": null,
    "nextStatement": null,
    "colour": 90
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

Blockly.JavaScript.forBlock['defect'] = function(block) {
  return ['move = "defect";', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript.forBlock['cooperate'] = function(block) {
  return ['move = "cooperate";', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['move'] = function(block) {
  var operator = block.getFieldValue('OPERATOR');
  var moveNumber = block.getFieldValue('MOVE_NUMBER');
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  var code = 'if (round ' + operator + ' ' + moveNumber + ') { \n' + statements + ' }\n';
  return code;
};

Blockly.JavaScript.forBlock['loop'] = function(block) {
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  var code = 'if (round > 0) { \n' + statements + ' }\n';
  return code;
};

Blockly.JavaScript.forBlock['if_last_move_cooperate'] = function(block) {
  var move = Blockly.JavaScript.valueToCode(block, 'MOVE', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'if (lastOpponentMove === "cooperate") { ' + move + ' }\n';
  return code;
};

Blockly.JavaScript.forBlock['if_last_move_defect'] = function(block) {
  var move = Blockly.JavaScript.valueToCode(block, 'MOVE', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'if (lastOpponentMove === "defect") { ' + move + ' }\n';
  return code;
};

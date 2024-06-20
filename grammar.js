/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "xenoncode",
  externals: $ => [
    $._indent,
    $._dedent,
    $._newline,
  ],

  "extras": $ => [
    ' ',
  ],

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => seq(
      optional($._top_level_definition),
      repeat(
        seq(
          repeat1($._newline),
          $._top_level_definition
        )
      ),
      repeat($._newline)
    ),
    function_definition: $ => seq(
      optional("recursive"),
      "function",
      field('name', $.user_function_name),
      field('parameters', $.parameter_list),
      optional(field('return_type', seq(
        ':',
        $.type
      ))),
      field('body', $.block),
    ),
    top_level_user_variable_definition: $ => seq(
      optional('storage'),
      $.user_variable_definition,
    ),
    user_variable_definition: $ => seq(
      choice(
        $.var_definition,
        $.array_definition
      ),
    ),
    array_definition: $ => seq(
      'array',
      $._var_with_type,
    ),
    var_definition: $ => seq(
      'var',
      choice(
        $._var_with_type,
        seq(
          $.user_var_name,
          '=',
          $._expression,
        )
      )
    ),
    user_function_name: $ => /@[a-zA-Z_-]+/,
    parameter_list: $ => seq(
      '(',
      optional(seq(
       $._var_with_type,
       optional(repeat(seq(
         ',',
         $._var_with_type
       ))),
       optional(',')
      )),
      ')'
    ),
    user_var_name: $ => /\$[a-zA-Z_-]+/,

    _var_with_type: $ => seq(
      $.user_var_name,
      ':',
      $.type
    ),

    _statement: $ => choice(
      $.user_variable_definition,
      $.user_var_assignment,
      $.function_call,
      $.if,
      $.return,
    ),

    return: $ => seq(
      "return",
      $._expression,
    ),

    if: $ => seq(
      "if",
      $._expression,
      $.block,
      repeat(seq(
        "elseif",
        $._expression,
        $.block
      )),
      optional(seq(
        "else",
        $.block
      )),
    ),

    dot_access: $ => seq(
      '.',
      choice(
        $.user_var_name,
        $.inbuilt,
      )
    ),

    user_var_assignment: $ => seq(
      $.user_var_name,
      repeat($.dot_access),
      choice(
        '=',
        '+=',
        '*=',
        '/=',
        '%=',
        '^=',
        '&=',
      ),
      $._expression
    ),
    
    type: $ => choice('number', 'text', /[a-zA-Z_-]+/),
    
    _top_level_definition: $ => choice(
      $.function_definition,
      $.top_level_user_variable_definition,
      $.special_block,
    ),

    special_block: $ => seq(
      field("block_name", choice(
        "init",
        "tick",
        seq(
          "timer",
          choice(
            "interval",
            "frequency",
          ),
          $.number
        ),
        seq(
          "input",
          $.dot_access,
        ), 
      )),
      $.block
    ),

    inbuilt: $ => /[a-zA-Z_-]+/,

    var: $ => choice(
      $.user_var_name,
      $.inbuilt,
    ),

    string: $ => /"([^"]|\\")*"/,
    number: $ => /([0-9]+(\.[0-9])?|\.[0-9]+)/,
    
    _expression: $ => choice(
      $.var,
      $.number,
      $.string,
      $.function_call,
      $.nested,
      $.unary_operator,
      $.binary_operator,
    ),

    binary_operator: $ => choice(
      prec.left(0, choice(
        seq($._expression, '+', $._expression),
        seq($._expression, '-', $._expression),
      )),
      prec.left(1, choice(
        seq($._expression, '*', $._expression),
        seq($._expression, '/', $._expression),
      )),
      prec.right(2, choice(
        seq($._expression, '^', $._expression),
        seq($._expression, '%', $._expression),
      )),
      prec.left(5, choice(
        seq($._expression, "<", $._expression),
        seq($._expression, "<=", $._expression),
        seq($._expression, ">", $._expression),
        seq($._expression, ">=", $._expression),
      )),
      prec.left(6, choice(
        seq($._expression, "==", $._expression),
        seq($._expression, "!=", $._expression),
      )),
      prec.left(7, seq(
        $._expression, choice("and", "&&"), $._expression
      )),
      prec.left(7, seq(
        $._expression, choice("or", "||"), $._expression
      )),
      prec.left(8, seq(
        $._expression, "xor", $._expression
      ))
    ),

    _prefix_unary_operator: $ => prec(3, choice(
      seq('-', $._expression),
      seq('!', $._expression),
    )),

    _suffix_unary_operator: $ => prec(4, choice(
      seq($.var, '++'),
      seq($.var, '--'),
      seq($.var, '!!'),
    )),

    unary_operator: $ => choice($._prefix_unary_operator, $._suffix_unary_operator),
    
    nested: $ => seq(
      '(',
      $._expression,
      ')',
    ),

    function_call: $ => seq(
      choice(
        $.user_function_name,
        $.inbuilt,
      ),
      '(',
      $._expression,
      repeat(
        seq(
          ',',
          $._expression,
        )
      ),
      optional(','),
      ')',
    ),

    
    block: $ => seq(
      $._indent,
      repeat($._newline),
      $._statement,
      repeat(seq(
        repeat1($._newline),
        $._statement,
      )),
      $._dedent,
    )
  }
});

#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"
#include <stdio.h>

enum TokenType {
  _INDENT,
  _DEDENT,
  _NEWLINE,
};

int indentation = 0;
int delta_indent = 0;

void *tree_sitter_xenoncode_external_scanner_create(void) {
  return NULL;
}

void tree_sitter_xenoncode_external_scanner_destroy(void *payload) {
  // nothing, no memory allocated
}

unsigned tree_sitter_xenoncode_external_scanner_serialize(
  void *payload,
  char *buffer
) {
  *(int*)(buffer) = indentation;
  *((int*)buffer + 1) = delta_indent;
  return sizeof(int) * 2;
}

void tree_sitter_xenoncode_external_scanner_deserialize(
  void *payload,
  const char *buffer,
  unsigned length
) {
  if (length == 0) {
    indentation = 0;
    delta_indent = 0;
  } else {
    indentation = *(int*)buffer;
    delta_indent = *((int*)buffer + 1);
  }
  // ...
}


// DEDENT or INDENT always have an implicit newline
bool tree_sitter_xenoncode_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {

  if (lexer->lookahead == '\n') {
    lexer->advance(lexer, false);
    unsigned int current_indentation = 0;
    while (lexer->lookahead == '\t') {
      current_indentation++;
      lexer->advance(lexer, true);
    }
    delta_indent = current_indentation - indentation;
    indentation = current_indentation;
    if (delta_indent == 0) {
      lexer->result_symbol = _NEWLINE;
      return true;
    }
  }

  if (delta_indent != 0) {
    // printf("delta_indent: %d\n", delta_indent);
    if (delta_indent < 0) {
      delta_indent++;
      lexer->result_symbol = _DEDENT;
    } else {
      delta_indent--;
      lexer->result_symbol = _INDENT;
    } 
    return true;
  }

  if (lexer->eof(lexer) && indentation > 0) {
    // printf("deintdenting eof\n");
    indentation--;
    lexer->result_symbol = _DEDENT;
    return true;
  }

  while (lexer->lookahead == '\t') {
    lexer->advance(lexer, true);
  }
  
  return false;
}

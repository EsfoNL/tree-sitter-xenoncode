package tree_sitter_xenoncode_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-xenoncode"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_xenoncode.Language())
	if language == nil {
		t.Errorf("Error loading Xenoncode grammar")
	}
}

/**
 * ESLint Rule: no-direct-dispatch
 * 
 * Enforces command layer usage - prevents direct dispatch of domain mutations from UI.
 * 
 * VIOLATIONS:
 * - Importing reducer action creators from domain/match/* in UI files
 * - Calling dispatch({ type: 'ADD_EVENT', ... }) directly
 * 
 * ALLOWED:
 * - dispatch(REPLACE_STATE) only in use_match_logic (internal)
 * - Calling command layer hooks (useMatchCommands, commands.*)
 * 
 * RATIONALE (P1.4):
 * Command guards must be mandatory. Direct mutations bypass validation/invariants.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce command layer usage instead of direct dispatch',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noDirectDispatch: 'Direct dispatch of "{{action}}" is not allowed. Use command layer (useMatchCommands) instead.',
      noReducerImport: 'Importing reducer actions from domain/match is not allowed in UI. Use command layer instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    
    // Only apply to files under src/features/** and src/components/** (UI layer)
    const isUIFile = /src\/(features|components)\//.test(filename);
    
    // Exempt use_match_logic.ts (internal hook that manages dispatch)
    const isInternalHook = filename.includes('use_match_logic');

    if (!isUIFile || isInternalHook) {
      return {}; // Skip this file
    }

    return {
      // Check imports from domain/match/* (reducer actions)
      ImportDeclaration(node) {
        const source = node.source.value;
        
        // Block imports of reducer action creators
        if (source.includes('domain/match') && !source.includes('types') && !source.includes('selectors')) {
          context.report({
            node,
            messageId: 'noReducerImport',
          });
        }
      },

      // Check dispatch calls with literal action objects
      CallExpression(node) {
        if (node.callee.name === 'dispatch' && node.arguments.length > 0) {
          const arg = node.arguments[0];
          
          // Check if it's an object literal with 'type' property
          if (arg.type === 'ObjectExpression') {
            const typeProperty = arg.properties.find(
              (prop) => prop.key && prop.key.name === 'type'
            );
            
            if (typeProperty && typeProperty.value) {
              const actionType = typeProperty.value.value;
              
              // Block common mutation actions
              const mutationActions = [
                'ADD_EVENT',
                'SET_TIME',
                'START_TIMER',
                'STOP_TIMER',
                'NEXT_PERIOD',
                'SET_PERIOD',
                'SUSPEND_MATCH',
                'TERMINATE_MATCH',
              ];
              
              if (mutationActions.includes(actionType)) {
                context.report({
                  node,
                  messageId: 'noDirectDispatch',
                  data: { action: actionType },
                });
              }
            }
          }
        }
      },
    };
  },
};

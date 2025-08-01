// Create apps/ai/src/baml/baml_src/automation.baml

class AutomationAction {
  type "click" | "type" | "scroll" | "wait" | "navigate" | "complete"
  target string? @description("Element to interact with, e.g. 'login button', 'email input field'")
  content string? @description("Text to type (for type action)")
  coordinates Coordinates? @description("Pixel coordinates (optional, for precise targeting)")
  reasoning string @description("Why this action is needed")
}

class Coordinates {
    x int
    y int
}

class AutomationPlan {
  reasoning string @description("Analysis of current page and next steps")
  actions AutomationAction[] @description("List of actions to execute")
  isComplete bool @description("Whether the goal has been achieved")
  nextStep string? @description("What to expect after these actions")
}

function PlanAutomation(
  goal: string,
  url: string, 
  screenshot: image,
  conversationHistory: string?
) -> AutomationPlan {
  client ClaudeSonnet
  prompt #"
    You are an expert web automation agent. Analyze the screenshot and plan the next actions.
    
    GOAL: {{goal}}
    CURRENT URL: {{url}}
    {% if conversationHistory %}
    PREVIOUS ACTIONS: {{conversationHistory}}
    {% endif %}
    
    Screenshot of current page:
    {{screenshot}}
    
    Instructions:
    1. Analyze what you see in the screenshot
    2. Determine what actions are needed to achieve the goal
    3. Plan 1-3 specific actions (don't over-plan)
    4. Be precise with element descriptions
    5. If goal is achieved, set isComplete to true
    
    {{ctx.output_format}}
  "#
}

function ContinueAutomation(
  goal: string,
  previousAction: string,
  previousResult: string,
  currentUrl: string,
  currentScreenshot: image,
  conversationHistory: string
) -> AutomationPlan {
  client ClaudeSonnet  
  prompt #"
    You are continuing a web automation task. The previous action was executed.
    
    GOAL: {{goal}}
    PREVIOUS ACTION: {{previousAction}}
    RESULT: {{previousResult}}
    CURRENT URL: {{currentUrl}}
    CONVERSATION HISTORY: {{conversationHistory}}
    
    Current screenshot:
    {{currentScreenshot}}
    
    Instructions:
    1. Analyze if the previous action worked as expected
    2. Check if we're closer to the goal
    3. Plan the next 1-3 actions
    4. If goal is achieved, set isComplete to true
    5. If stuck, try alternative approaches
    
    {{ctx.output_format}}
  "#
}
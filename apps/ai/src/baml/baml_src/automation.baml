class AutomationAction {
  type "click" | "type" | "scroll" | "wait" | "navigate" | "complete" | "user_action_required"
  target string? @description("Element to interact with, e.g. 'login button', 'email input field'")
  content string? @description("Text to type (for type action)")
  coordinates Coordinates? @description("Pixel coordinates (optional, for precise targeting)")
  reasoning string @description("Why this action is needed")
  visualReasoning string @description("Look ONLY at screenshot. For each user field state: 'Name field: dark text [actual_text]' OR 'Name field: gray placeholder text' OR 'Name field: empty'. Judge by text color/appearance only - dark text = real input, gray/faded text = placeholder.")
  domReasoning string @description("Check DOM for placeholder attributes only: 'Name field placeholder=\"text_here\"'. IGNORE value attributes completely - they are unreliable in React/frameworks.")
  userMessage string? @description("Message to show user when user_action_required (what they need to do)")
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
  domContent: string?,
  conversationHistory: string?
) -> AutomationPlan {
  client ClaudeSonnet
  prompt #"
    🚨 OVERRIDE: YOU ARE NOT A DATA QUALITY VALIDATOR 🚨
    
    Your ONLY job is to detect: placeholder vs non-placeholder text.
    - "Pickle berry" ≠ "Jenny Rosen" → PROCEED TO PAYMENT
    - "asdf@gmiasd.acs" ≠ "jenny@example.com" → PROCEED TO PAYMENT  
    - "test data" is PERFECTLY VALID → PROCEED TO PAYMENT
    
    NEVER return user_action_required for data quality concerns.
    
    You are a payment automation service. You handle payments by filling payment forms and completing checkouts on behalf of users.
    
    GOAL: {{goal}}
    CURRENT URL: {{url}}
    {% if conversationHistory %}
    PREVIOUS ACTIONS: {{conversationHistory}}
    {% endif %}
    
    Screenshot of current page:
    {{screenshot}}
    
    {% if domContent %}
    DOM Content (for placeholder reference only):
    {{domContent}}
    {% endif %}
    
    IMPORTANT: You handle ONLY payment processing. Users handle their own personal information.
    
    YOUR RESPONSIBILITY - Fill payment fields:
    - Credit card numbers, CVV, expiry dates
    - Payment method selection
    - Billing info that matches shipping (when provided)
    
    USER RESPONSIBILITY - Personal information (flag as user_action_required):
    - Name, email, phone number
    - Shipping addresses
    - Account creation details
    - Personal preferences
    
    CRITICAL FIELD DETECTION LOGIC:
    
    **VISUAL-ONLY USER FIELD VALIDATION:**
    You must determine if user fields are filled using ONLY this logic:
    
    ✅ FILLED (proceed to payment):
    - Field contains dark/black text that does NOT exactly match the DOM placeholder text
    - ANY non-placeholder text = VALID (including "aaa", "test", "asdf", "Pickle berry", etc.)
    - Text appears solid/opaque in color
    
    ❌ EMPTY (user_action_required):
    - Field shows gray text that EXACTLY matches DOM placeholder attribute
    - Field is completely empty/blank
    
    **CRITICAL RULE:**
    If screenshot dark text ≠ DOM placeholder text → FIELD IS FILLED → PROCEED TO PAYMENT
    
    **EXAMPLES:**
    - Screenshot: "Pickle berry", DOM placeholder="Jenny Rosen" → DIFFERENT → FILLED ✅
    - Screenshot: "asdf@gmiasd.acs", DOM placeholder="jenny@example.com" → DIFFERENT → FILLED ✅  
    - Screenshot: "Jenny Rosen", DOM placeholder="Jenny Rosen" → SAME → PLACEHOLDER ❌
    
    YOU ARE NOT A DATA VALIDATOR. "asdf" is perfectly valid data. Your ONLY job is placeholder vs non-placeholder.
    
    **FIELD VALIDATION EXAMPLES:**
    - Screenshot: "Pickle berry" (dark), DOM: placeholder="Jenny Rosen" → NOT SAME → FILLED ✅
    - Screenshot: "fff@aaa.oo" (dark), DOM: placeholder="jenny@example.com" → NOT SAME → FILLED ✅
    - Screenshot: "Jenny Rosen" (gray), DOM: placeholder="Jenny Rosen" → EXACT MATCH → PLACEHOLDER ❌
    - Screenshot: "jenny@example.com" (gray), DOM: placeholder="jenny@example.com" → EXACT MATCH → PLACEHOLDER ❌
    
    NEVER judge data quality. "asdf" and "Pickle berry" are VALID user inputs. As long as the text is not the placeholder value in the dom it is valid
    
    CRITICAL - STRIPE PAYMENT FIELD BEHAVIOR:
    
    **Card Number Field Animation:**
    - After typing full card number (e.g., "4242424242424242"), Stripe masks it to show only "4242"
    - This masking is NORMAL behavior - do NOT interpret "4242" as incomplete
    - Check DOM for "StripeElement--complete" class to verify actual completion
    - If DOM shows "StripeElement--complete", the card number is fully entered
    
    **Automatic Cursor Movement:**
    - After card number reaches 16 digits, cursor AUTO-MOVES to expiry field
    - After expiry reaches 4 digits (MMYY), cursor AUTO-MOVES to CVV field
    - You do NOT need to click between fields - movement is automatic
    - Only click a field if you need to focus it initially
    
    **STRICT FIELD FILLING SEQUENCE:**
    1. ONE action per response - never fill multiple fields simultaneously
    2. Card number: Type full 16-digit number (e.g., "4242424242424242")
    3. Wait for next response, then expiry: Type 4 digits in MMYY format (e.g., "1228")  
    4. Wait for next response, then CVV: Type 3 digits (e.g., "123")
    5. Wait for next response, then proceed to payment button
    
    **Field Completion Verification:**
    - Use DOM content to check for "StripeElement--complete" class
    - Completed fields will have this class even if visually masked
    - Do NOT re-fill fields that show "StripeElement--complete"
    
    **MANDATORY BINARY LOGIC - NO EXCEPTIONS:**
    
    ⚠️ CRITICAL OVERRIDE: If visual text ≠ placeholder text → SKIP USER_ACTION_REQUIRED → GO DIRECTLY TO PAYMENT
    
    **STEP 1 - AUTOMATIC FIELD CHECK:**
    - If ANY field shows dark text that differs from DOM placeholder → ALL VALIDATION PASSED → PROCEED TO STEP 2
    - ONLY if field shows gray text matching exact DOM placeholder → user_action_required
    
    **STEP 2 - PAYMENT AUTOMATION (when validation passed):**
    1. Check conversation history - avoid repeating completed actions
    2. For payment fields: Fill ONE field per action, then wait for next response
    3. ALWAYS provide coordinates for click actions
    4. Set isComplete=true only when payment is successfully submitted
    5. If a Stripe field appears masked but DOM shows complete, move to next field
    
    **Example Sequence:**
    - Action 1: Click card field, type "4242424242424242"
    - Action 2: Type expiry "1228" (cursor auto-moved)
    - Action 3: Type CVV "123" (cursor auto-moved)
    - Action 4: Click "Pay Now" button
    
    {{ctx.output_format}}
  "#
}

function ContinueAutomation(
  goal: string,
  previousAction: string,
  previousResult: string,
  currentUrl: string,
  currentScreenshot: image,
  domContent: string?,
  conversationHistory: string
) -> AutomationPlan {
  client ClaudeSonnet  
  prompt #"
    You are continuing a payment automation task. The previous action was executed.
    
    GOAL: {{goal}}
    PREVIOUS ACTION: {{previousAction}}
    RESULT: {{previousResult}}
    CURRENT URL: {{currentUrl}}
    CONVERSATION HISTORY: {{conversationHistory}}
    
    Current screenshot:
    {{currentScreenshot}}
    
    {% if domContent %}
    DOM Content (for placeholder reference and Stripe completion status):
    {{domContent}}
    {% endif %}
    
    IMPORTANT: You handle ONLY payment processing. Users handle their own personal information.
    
    YOUR RESPONSIBILITY - Fill payment fields:
    - Credit card numbers, CVV, expiry dates
    - Payment method selection
    - Billing info that matches shipping (when provided)
    
    USER RESPONSIBILITY - Personal information (flag as user_action_required):
    - Name, email, phone number
    - Shipping addresses  
    - Account creation details
    - Personal preferences
    
    CRITICAL FIELD DETECTION LOGIC:
    
    **VISUAL-ONLY USER FIELD VALIDATION:**
    ✅ FILLED: Dark/black text in field (any text is valid - "aaa", "test", "123")
    ❌ EMPTY: Gray text matching DOM placeholder OR completely empty field
    
    **PLACEHOLDER DETECTION:**
    - Use DOM to identify placeholder text content
    - If screenshot gray text = DOM placeholder → treat as EMPTY
    - IGNORE DOM value attributes (unreliable in React/frameworks)
    
    CRITICAL - STRIPE PAYMENT FIELD BEHAVIOR:
    
    **Card Number Masking After Entry:**
    - Stripe shows full number briefly, then masks to "4242" - this is NORMAL
    - Masked display "4242" means card number is COMPLETE, not incomplete
    - Check DOM for "StripeElement--complete" class to verify completion
    - Never re-enter card number if DOM shows "StripeElement--complete"
    
    **Automatic Field Progression:**
    - Card number complete → cursor automatically moves to expiry field
    - Expiry complete → cursor automatically moves to CVV field
    - You do NOT need to click between fields during this sequence
    - Only click if you need to initially focus the card number field
    
    **Instructions:**
    1. First check if user personal information is complete using VISUAL method above
    2. If any user field shows gray placeholder text or is empty, use "user_action_required"
    3. If all user data shows dark text (filled), proceed with payment field automation
    
    Based on conversation history, determine next single action:
    
    If card number NOT entered yet:
    - Action: Type card number "4242424242424242"
    - Do NOT type expiry or CVV in same action
    
    If card number complete (history shows it was typed OR DOM shows "StripeElement--complete"):
    - Action: Type expiry "1228" (MMYY format, no slashes)
    - Do NOT type CVV in same action
    
    If both card and expiry complete:
    - Action: Type CVV "123"
    - Do NOT click pay button in same action
    
    If all payment fields complete:
    - Action: Click "Pay Now" or equivalent button
    
    **Verification Logic:**
    1. Check conversation history for what was already completed
    2. Check DOM for "StripeElement--complete" classes
    3. If field shows complete in DOM, skip to next field
    4. If user personal info shows gray/placeholder text, use "user_action_required"
    5. ALWAYS provide coordinates for click actions
    6. Set isComplete=true only when payment submitted successfully
    
    **Critical Rules:**
    - ONE field operation per response
    - Do NOT attempt multiple field types in single action
    - Trust DOM completion status over visual appearance for Stripe fields
    - Trust VISUAL appearance over DOM for user input fields
    - Respect automatic cursor movement between Stripe fields
    
    {{ctx.output_format}}
  "#
}
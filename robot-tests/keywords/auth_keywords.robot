*** Settings ***
Resource    ../resources/common.robot

*** Variables ***
# Auth page selectors
${SIGN_IN_PAGE}           =    /sign-in
${SIGN_UP_PAGE}           =    /sign-up
${FORGOT_PASSWORD_PAGE}   =    /forgot-password
${RESET_PASSWORD_PAGE}    =    /reset-password

${EMAIL_FIELD}            =    //input[@name='email']
${PASSWORD_FIELD}         =    //input[@type='password']
${CONFIRM_PASSWORD_FIELD} =    //input[@name='confirmPassword']
${SIGN_IN_FORM_BUTTON}    =    //button[@type='submit']
${SIGN_UP_FORM_BUTTON}    =    //button[@type='submit']
${FORGOT_PASSWORD_BUTTON} =    //button[@type='submit']
${RESET_PASSWORD_BUTTON}  =    //button[@type='submit']

${SIGN_UP_LINK}           =    //a[contains(text(),'Sign up')]
${SIGN_IN_LINK}           =    //a[contains(text(),'Sign In')]
${FORGOT_PASSWORD_LINK}   =    //a[contains(text(),'Forgot password')]

${AUTH_ERROR_MESSAGE}     =    //*[contains(@class,'error') or contains(@class,'destructive')]
${AUTH_SUCCESS_MESSAGE}   =    //*[contains(@class,'success') or contains(@class,'positive')]

*** Keywords ***
Navigate To Sign In Page
    [Documentation]    Navigates to the sign-in page
    Navigate To Page    ${SIGN_IN_PAGE}
    Wait For Element And Take Screenshot    ${SIGN_IN_FORM_BUTTON}    sign_in_page

Navigate To Sign Up Page
    [Documentation]    Navigates to the sign-up page
    Navigate To Page    ${SIGN_UP_PAGE}
    Wait For Element And Take Screenshot    ${SIGN_UP_FORM_BUTTON}    sign_up_page

Navigate To Forgot Password Page
    [Documentation]    Navigates to the forgot password page
    Navigate To Page    ${FORGOT_PASSWORD_PAGE}
    Wait For Element And Take Screenshot    ${FORGOT_PASSWORD_BUTTON}    forgot_password_page

Fill Sign In Form
    [Documentation]    Fills the sign-in form with provided credentials
    [Arguments]    ${email}    ${password}
    Input Text And Verify    ${EMAIL_FIELD}    ${email}
    Input Text And Verify    ${PASSWORD_FIELD}    ${password}
    Take Screenshot With Timestamp    sign_in_form_filled

Fill Sign Up Form
    [Documentation]    Fills the sign-up form with provided credentials
    [Arguments]    ${email}    ${password}    ${confirm_password}=${password}
    Input Text And Verify    ${EMAIL_FIELD}    ${email}
    Input Text And Verify    ${PASSWORD_FIELD}    ${password}
    Input Text And Verify    ${CONFIRM_PASSWORD_FIELD}    ${confirm_password}
    Take Screenshot With Timestamp    sign_up_form_filled

Submit Sign In Form
    [Documentation]    Submits the sign-in form
    Click And Wait    ${SIGN_IN_FORM_BUTTON}
    Take Screenshot With Timestamp    sign_in_submitted

Submit Sign Up Form
    [Documentation]    Submits the sign-up form
    Click And Wait    ${SIGN_UP_FORM_BUTTON}
    Take Screenshot With Timestamp    sign_up_submitted

Submit Forgot Password Form
    [Documentation]    Submits the forgot password form
    [Arguments]    ${email}
    Input Text And Verify    ${EMAIL_FIELD}    ${email}
    Click And Wait    ${FORGOT_PASSWORD_BUTTON}
    Take Screenshot With Timestamp    forgot_password_submitted

Verify Sign In Success
    [Documentation]    Verifies successful sign-in
    Wait For Page To Load
    Page Should Not Contain Element    ${SIGN_IN_FORM_BUTTON}
    Take Screenshot With Timestamp    sign_in_success

Verify Sign Up Success
    [Documentation]    Verifies successful sign-up
    Wait For Page To Load
    # Usually redirects to verification page or dashboard
    Page Should Not Contain Element    ${SIGN_UP_FORM_BUTTON}
    Take Screenshot With Timestamp    sign_up_success

Verify Auth Error Message
    [Documentation]    Verifies error message is displayed
    [Arguments]    ${expected_message}
    Wait Until Element Is Visible    ${AUTH_ERROR_MESSAGE}
    ${error_text}=    Get Text    ${AUTH_ERROR_MESSAGE}
    Should Contain    ${error_text}    ${expected_message}
    Take Screenshot With Timestamp    auth_error_displayed

Verify Auth Success Message
    [Documentation]    Verifies success message is displayed
    [Arguments]    ${expected_message}
    Wait Until Element Is Visible    ${AUTH_SUCCESS_MESSAGE}
    ${success_text}=    Get Text    ${AUTH_SUCCESS_MESSAGE}
    Should Contain    ${success_text}    ${expected_message}
    Take Screenshot With Timestamp    auth_success_displayed

Sign Out User
    [Documentation]    Signs out the current user
    Wait Until Element Is Visible    ${SIGN_OUT_BUTTON}
    Click And Wait    ${SIGN_OUT_BUTTON}
    Wait For Element And Take Screenshot    ${SIGN_IN_FORM_BUTTON}    signed_out

Verify User Is Logged In
    [Documentation]    Verifies user is logged in
    Page Should Not Contain Element    ${SIGN_IN_FORM_BUTTON}
    Page Should Contain Element    ${SIGN_OUT_BUTTON}
    Take Screenshot With Timestamp    user_logged_in

Verify User Is Logged Out
    [Documentation]    Verifies user is logged out
    Page Should Contain Element    ${SIGN_IN_FORM_BUTTON}
    Page Should Not Contain Element    ${SIGN_OUT_BUTTON}
    Take Screenshot With Timestamp    user_logged_out

Test Valid Sign In
    [Documentation]    Tests sign in with valid credentials
    [Arguments]    ${email}    ${password}
    Navigate To Sign In Page
    Fill Sign In Form    ${email}    ${password}
    Submit Sign In Form
    Verify Sign In Success
    Verify User Is Logged In

Test Invalid Sign In
    [Documentation]    Tests sign in with invalid credentials
    [Arguments]    ${email}    ${password}    ${expected_error}
    Navigate To Sign In Page
    Fill Sign In Form    ${email}    ${password}
    Submit Sign In Form
    Verify Auth Error Message    ${expected_error}
    Verify User Is Logged Out

Test Valid Sign Up
    [Documentation]    Tests sign up with valid credentials
    [Arguments]    ${email}    ${password}
    Navigate To Sign Up Page
    Fill Sign Up Form    ${email}    ${password}
    Submit Sign Up Form
    Verify Sign Up Success
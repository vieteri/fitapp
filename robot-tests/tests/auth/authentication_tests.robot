*** Settings ***
Documentation    Authentication workflow tests for the fitness application
Resource         ../../resources/common.robot
Resource         ../../keywords/auth_keywords.robot
Suite Setup      Setup Test Environment
Suite Teardown   Teardown Test Environment
Test Setup       Open Browser To Application
Test Teardown    Close Browser Session

*** Variables ***
${VALID_EMAIL}       test@example.com
${VALID_PASSWORD}    testpass123
${INVALID_EMAIL}     invalid@example.com
${INVALID_PASSWORD}  wrongpassword

*** Test Cases ***
User Can Sign In With Valid Credentials
    [Documentation]    Test that a user can successfully sign in with valid credentials
    [Tags]    auth    positive    smoke
    Test Valid Sign In    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Verify User Is Logged In
    Take Screenshot With Timestamp    successful_sign_in

User Cannot Sign In With Invalid Email
    [Documentation]    Test that a user cannot sign in with invalid email
    [Tags]    auth    negative
    Test Invalid Sign In    ${INVALID_EMAIL}    ${VALID_PASSWORD}    Invalid credentials
    Verify User Is Logged Out
    Take Screenshot With Timestamp    invalid_email_sign_in

User Cannot Sign In With Invalid Password
    [Documentation]    Test that a user cannot sign in with invalid password
    [Tags]    auth    negative
    Test Invalid Sign In    ${VALID_EMAIL}    ${INVALID_PASSWORD}    Invalid credentials
    Verify User Is Logged Out
    Take Screenshot With Timestamp    invalid_password_sign_in

User Cannot Sign In With Empty Fields
    [Documentation]    Test that a user cannot sign in with empty fields
    [Tags]    auth    negative    validation
    Navigate To Sign In Page
    Submit Sign In Form
    Page Should Contain    required
    Take Screenshot With Timestamp    empty_fields_sign_in

User Can Sign Up With Valid Data
    [Documentation]    Test that a user can successfully sign up with valid data
    [Tags]    auth    positive    registration
    ${test_email}    ${test_username}=    Generate Test Data
    Test Valid Sign Up    ${test_email}    ${VALID_PASSWORD}
    Take Screenshot With Timestamp    successful_sign_up

User Cannot Sign Up With Existing Email
    [Documentation]    Test that a user cannot sign up with an existing email
    [Tags]    auth    negative    registration
    Test Invalid Sign Up    ${VALID_EMAIL}    ${VALID_PASSWORD}    already exists
    Take Screenshot With Timestamp    existing_email_sign_up

User Cannot Sign Up With Weak Password
    [Documentation]    Test that a user cannot sign up with a weak password
    [Tags]    auth    negative    validation
    ${test_email}    ${test_username}=    Generate Test Data
    Test Invalid Sign Up    ${test_email}    123    password too weak
    Take Screenshot With Timestamp    weak_password_sign_up

User Cannot Sign Up With Mismatched Passwords
    [Documentation]    Test that a user cannot sign up with mismatched passwords
    [Tags]    auth    negative    validation
    ${test_email}    ${test_username}=    Generate Test Data
    Navigate To Sign Up Page
    Fill Sign Up Form    ${test_email}    ${VALID_PASSWORD}    differentpassword
    Submit Sign Up Form
    Page Should Contain    passwords do not match
    Take Screenshot With Timestamp    mismatched_passwords_sign_up

User Can Request Password Reset
    [Documentation]    Test that a user can request a password reset
    [Tags]    auth    positive    password_reset
    Navigate To Forgot Password Page
    Submit Forgot Password Form    ${VALID_EMAIL}
    Verify Auth Success Message    reset email sent
    Take Screenshot With Timestamp    password_reset_requested

User Can Navigate Between Auth Pages
    [Documentation]    Test navigation between authentication pages
    [Tags]    auth    positive    navigation
    Navigate To Sign In Page
    Take Screenshot With Timestamp    sign_in_page_navigation
    
    Click Element    ${SIGN_UP_LINK}
    Wait For Element And Take Screenshot    ${SIGN_UP_FORM_BUTTON}    sign_up_page_navigation
    
    Click Element    ${SIGN_IN_LINK}
    Wait For Element And Take Screenshot    ${SIGN_IN_FORM_BUTTON}    back_to_sign_in_navigation
    
    Click Element    ${FORGOT_PASSWORD_LINK}
    Wait For Element And Take Screenshot    ${FORGOT_PASSWORD_BUTTON}    forgot_password_page_navigation

User Can Sign Out Successfully
    [Documentation]    Test that a user can sign out successfully
    [Tags]    auth    positive    logout
    Test Valid Sign In    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Verify User Is Logged In
    Sign Out User
    Verify User Is Logged Out
    Take Screenshot With Timestamp    successful_sign_out

Sign In Form Validation Works
    [Documentation]    Test that sign in form validation works correctly
    [Tags]    auth    validation
    Navigate To Sign In Page
    
    # Test empty email
    Fill Sign In Form    ${EMPTY}    ${VALID_PASSWORD}
    Submit Sign In Form
    Page Should Contain    required
    Take Screenshot With Timestamp    empty_email_validation
    
    # Test invalid email format
    Fill Sign In Form    invalid-email    ${VALID_PASSWORD}
    Submit Sign In Form
    Page Should Contain    invalid email
    Take Screenshot With Timestamp    invalid_email_format_validation
    
    # Test empty password
    Fill Sign In Form    ${VALID_EMAIL}    ${EMPTY}
    Submit Sign In Form
    Page Should Contain    required
    Take Screenshot With Timestamp    empty_password_validation

Auth Flow With Apple Sign In
    [Documentation]    Test Apple Sign In integration (if available)
    [Tags]    auth    apple    integration
    Navigate To Sign In Page
    ${apple_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Apple')]
    Run Keyword If    ${apple_button_present}    Click Element    //button[contains(text(),'Apple')]
    Run Keyword If    ${apple_button_present}    Take Screenshot With Timestamp    apple_sign_in_clicked

Session Persistence After Browser Refresh
    [Documentation]    Test that user session persists after browser refresh
    [Tags]    auth    session    persistence
    Test Valid Sign In    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Verify User Is Logged In
    Reload Page
    Wait For Page To Load
    Verify User Is Logged In
    Take Screenshot With Timestamp    session_persisted_after_refresh

*** Keywords ***
Test Invalid Sign Up
    [Documentation]    Tests sign up with invalid credentials
    [Arguments]    ${email}    ${password}    ${expected_error}
    Navigate To Sign Up Page
    Fill Sign Up Form    ${email}    ${password}
    Submit Sign Up Form
    Verify Auth Error Message    ${expected_error}
    Verify User Is Logged Out
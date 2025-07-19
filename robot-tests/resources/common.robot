*** Settings ***
Library    SeleniumLibrary
Library    RequestsLibrary
Library    Collections
Library    String
Library    DateTime
Library    OperatingSystem

*** Variables ***
${BROWSER}                Chrome
${HEADLESS}               False
${IMPLICIT_WAIT}          10
${EXPLICIT_WAIT}          30
${BASE_URL}               %{BASE_URL=http://localhost:3000}
${SCREENSHOT_DIR}         screenshots
${RESULTS_DIR}            reports

# User Test Data - loaded from environment variables
${TEST_EMAIL}             %{TEST_EMAIL}
${TEST_PASSWORD}          %{TEST_PASSWORD}
${TEST_USERNAME}          %{TEST_USERNAME}
${INVALID_EMAIL}          %{INVALID_EMAIL=invalid@example.com}
${INVALID_PASSWORD}       %{INVALID_PASSWORD=wrongpassword}

# Common Selectors
${SIGN_IN_BUTTON}         //button[contains(text(),'Sign In')]
${SIGN_OUT_BUTTON}        //*[contains(text(),'Sign Out')]
${EMAIL_INPUT}            //input[@type='email']
${PASSWORD_INPUT}         //input[@type='password']
${SUBMIT_BUTTON}          //button[@type='submit']
${ERROR_MESSAGE}          //*[contains(@class,'error')]
${SUCCESS_MESSAGE}        //*[contains(@class,'success')]
${LOADING_SPINNER}        //*[contains(@class,'loading')]

*** Keywords ***
Open Browser To Application
    [Documentation]    Opens browser to the application base URL
    [Arguments]    ${url}=${BASE_URL}
    Run Keyword If    ${HEADLESS}    Open Browser    ${url}    headlesschrome
    ...    ELSE    Open Browser    ${url}    Chrome
    Set Window Size    1920    1080
    Set Selenium Implicit Wait    ${IMPLICIT_WAIT}

Close Browser Session
    [Documentation]    Closes the browser session
    Close Browser

Take Screenshot With Timestamp
    [Documentation]    Takes a screenshot with timestamp in filename
    [Arguments]    ${name}
    ${timestamp}=    Get Current Date    result_format=%Y%m%d_%H%M%S
    ${current_dir}=    Get Location
    ${absolute_screenshot_dir}=    Set Variable    ${EXECDIR}/screenshots
    ${screenshot_path}=    Set Variable    ${absolute_screenshot_dir}/${name}_${timestamp}.png
    Create Directory    ${absolute_screenshot_dir}
    Capture Page Screenshot    ${screenshot_path}
    Log    Screenshot saved: ${screenshot_path}
    RETURN    ${screenshot_path}

Wait For Element And Take Screenshot
    [Documentation]    Waits for element to be visible and takes screenshot
    [Arguments]    ${locator}    ${screenshot_name}
    Wait Until Element Is Visible    ${locator}    timeout=${EXPLICIT_WAIT}
    Take Screenshot With Timestamp    ${screenshot_name}

Wait For Page To Load
    [Documentation]    Waits for page to fully load
    Wait For Condition    return document.readyState === 'complete'    timeout=${EXPLICIT_WAIT}
    Sleep    1s    # Additional wait for dynamic content

Click And Wait
    [Documentation]    Clicks element and waits for page to load
    [Arguments]    ${locator}
    Click Element    ${locator}
    Wait For Page To Load

Input Text And Verify
    [Documentation]    Inputs text and verifies it was entered correctly
    [Arguments]    ${locator}    ${text}
    Wait Until Element Is Visible    ${locator}
    Clear Element Text    ${locator}
    Input Text    ${locator}    ${text}
    ${actual_value}=    Get Element Attribute    ${locator}    value
    Should Be Equal    ${actual_value}    ${text}

Navigate To Page
    [Documentation]    Navigates to a specific page
    [Arguments]    ${path}
    ${url}=    Set Variable    ${BASE_URL}${path}
    Go To    ${url}
    Wait For Page To Load

Verify Page Title
    [Documentation]    Verifies the page title contains expected text
    [Arguments]    ${expected_title}
    ${actual_title}=    Get Title
    Should Contain    ${actual_title}    ${expected_title}

Verify Element Contains Text
    [Documentation]    Verifies element contains expected text
    [Arguments]    ${locator}    ${expected_text}
    Wait Until Element Is Visible    ${locator}
    ${actual_text}=    Get Text    ${locator}
    Should Contain    ${actual_text}    ${expected_text}

Wait For Ajax Request
    [Documentation]    Waits for AJAX requests to complete
    Wait For Condition    return jQuery.active == 0    timeout=${EXPLICIT_WAIT}

Generate Test Data
    [Documentation]    Generates unique test data
    ${timestamp}=    Get Current Date    result_format=%Y%m%d%H%M%S
    ${random_email}=    Set Variable    test${timestamp}@example.com
    ${random_username}=    Set Variable    testuser${timestamp}
    RETURN    ${random_email}    ${random_username}

Setup Test Environment
    [Documentation]    Sets up the test environment
    Open Browser To Application
    Take Screenshot With Timestamp    test_start

Teardown Test Environment
    [Documentation]    Tears down the test environment
    Take Screenshot With Timestamp    test_end
    Close Browser Session

Verify No Javascript Errors
    [Documentation]    Verifies no JavaScript errors in console
    ${logs}=    Get Browser Logs
    FOR    ${log}    IN    @{logs}
        Should Not Contain    ${log}    ERROR
    END
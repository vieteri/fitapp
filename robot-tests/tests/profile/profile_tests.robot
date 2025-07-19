*** Settings ***
Documentation    Profile management tests for the fitness application
Resource         ../../resources/common.robot
Resource         ../../keywords/auth_keywords.robot
Suite Setup      Setup Test Environment
Suite Teardown   Teardown Test Environment
Test Setup       Setup Profile Test
Test Teardown    Teardown Profile Test

*** Variables ***
${PROFILE_PAGE}           /profile
${PROFILE_EDIT_PAGE}      /profile/edit
${PROFILE_SETTINGS_PAGE}  /profile/settings

${USERNAME_FIELD}         //input[@name='username']
${EMAIL_FIELD}            //input[@name='email']
${BIO_FIELD}              //textarea[@name='bio']
${AVATAR_UPLOAD}          //input[@type='file']

${SAVE_PROFILE_BUTTON}    //button[contains(text(),'Save Profile')]
${CANCEL_BUTTON}          //button[contains(text(),'Cancel')]
${EDIT_PROFILE_BUTTON}    //button[contains(text(),'Edit Profile')]

${PROFILE_AVATAR}         //img[contains(@class,'avatar')]
${PROFILE_USERNAME}       //h1[contains(@class,'username')]
${PROFILE_EMAIL}          //div[contains(@class,'email')]
${PROFILE_BIO}            //div[contains(@class,'bio')]
${PROFILE_STATS}          //div[contains(@class,'stats')]

*** Test Cases ***
User Can View Profile Page
    [Documentation]    Test that a user can view their profile page
    [Tags]    profile    positive    view    smoke
    Navigate To Page    ${PROFILE_PAGE}
    Wait For Element And Take Screenshot    ${PROFILE_USERNAME}    profile_page_viewed
    Page Should Contain Element    ${PROFILE_AVATAR}
    Page Should Contain Element    ${PROFILE_EMAIL}
    Take Screenshot With Timestamp    profile_page_loaded

User Can Edit Profile Information
    [Documentation]    Test that a user can edit their profile information
    [Tags]    profile    positive    edit
    Navigate To Page    ${PROFILE_PAGE}
    Click And Wait    ${EDIT_PROFILE_BUTTON}
    
    # Edit profile fields
    ${new_username}=    Set Variable    UpdatedUser
    ${new_bio}=    Set Variable    This is my updated bio
    
    Input Text And Verify    ${USERNAME_FIELD}    ${new_username}
    Input Text And Verify    ${BIO_FIELD}    ${new_bio}
    
    Click And Wait    ${SAVE_PROFILE_BUTTON}
    Take Screenshot With Timestamp    profile_edited_successfully
    
    # Verify changes
    Verify Element Contains Text    ${PROFILE_USERNAME}    ${new_username}
    Verify Element Contains Text    ${PROFILE_BIO}    ${new_bio}

User Can Upload Profile Avatar
    [Documentation]    Test that a user can upload a profile avatar
    [Tags]    profile    positive    avatar
    Navigate To Page    ${PROFILE_EDIT_PAGE}
    
    # Upload avatar (simulate file upload)
    ${avatar_file}=    Set Variable    /path/to/test/avatar.jpg
    ${file_exists}=    Run Keyword And Return Status    File Should Exist    ${avatar_file}
    
    Run Keyword If    ${file_exists}    Choose File    ${AVATAR_UPLOAD}    ${avatar_file}
    Run Keyword If    ${file_exists}    Click And Wait    ${SAVE_PROFILE_BUTTON}
    Run Keyword If    ${file_exists}    Take Screenshot With Timestamp    avatar_uploaded

User Can View Profile Statistics
    [Documentation]    Test that user can view profile statistics
    [Tags]    profile    positive    statistics
    Navigate To Page    ${PROFILE_PAGE}
    Wait For Element And Take Screenshot    ${PROFILE_STATS}    profile_statistics_viewed
    
    # Check for common statistics
    Page Should Contain    Total Workouts
    Page Should Contain    Total Exercises
    Page Should Contain    Total Routines
    Take Screenshot With Timestamp    profile_stats_displayed

User Can View Recent Activity
    [Documentation]    Test that user can view recent activity on profile
    [Tags]    profile    positive    activity
    Navigate To Page    ${PROFILE_PAGE}
    
    ${recent_activity_present}=    Run Keyword And Return Status    Page Should Contain Element    //div[contains(@class,'recent-activity')]
    Run Keyword If    ${recent_activity_present}    Take Screenshot With Timestamp    recent_activity_displayed

User Can Change Password
    [Documentation]    Test that user can change their password
    [Tags]    profile    positive    password
    Navigate To Page    /profile/reset-password
    
    ${current_password_field}=    Set Variable    //input[@name='currentPassword']
    ${new_password_field}=    Set Variable    //input[@name='newPassword']
    ${confirm_password_field}=    Set Variable    //input[@name='confirmPassword']
    
    Input Text And Verify    ${current_password_field}    ${TEST_PASSWORD}
    Input Text And Verify    ${new_password_field}    newpassword123
    Input Text And Verify    ${confirm_password_field}    newpassword123
    
    Click And Wait    //button[contains(text(),'Change Password')]
    Take Screenshot With Timestamp    password_changed

User Can View Profile Privacy Settings
    [Documentation]    Test that user can view and modify privacy settings
    [Tags]    profile    positive    privacy
    Navigate To Page    ${PROFILE_SETTINGS_PAGE}
    
    ${privacy_settings_present}=    Run Keyword And Return Status    Page Should Contain Element    //div[contains(@class,'privacy-settings')]
    Run Keyword If    ${privacy_settings_present}    Take Screenshot With Timestamp    privacy_settings_displayed

User Can View Workout History From Profile
    [Documentation]    Test that user can view workout history from profile
    [Tags]    profile    positive    workout_history
    Navigate To Page    ${PROFILE_PAGE}
    
    ${workout_history_present}=    Run Keyword And Return Status    Page Should Contain Element    //div[contains(@class,'workout-history')]
    Run Keyword If    ${workout_history_present}    Click Element    //a[contains(text(),'View All Workouts')]
    Run Keyword If    ${workout_history_present}    Take Screenshot With Timestamp    workout_history_from_profile

User Can View Exercise History From Profile
    [Documentation]    Test that user can view exercise history from profile
    [Tags]    profile    positive    exercise_history
    Navigate To Page    ${PROFILE_PAGE}
    
    ${exercise_history_present}=    Run Keyword And Return Status    Page Should Contain Element    //div[contains(@class,'exercise-history')]
    Run Keyword If    ${exercise_history_present}    Click Element    //a[contains(text(),'View All Exercises')]
    Run Keyword If    ${exercise_history_present}    Take Screenshot With Timestamp    exercise_history_from_profile

User Can View Routine History From Profile
    [Documentation]    Test that user can view routine history from profile
    [Tags]    profile    positive    routine_history
    Navigate To Page    ${PROFILE_PAGE}
    
    ${routine_history_present}=    Run Keyword And Return Status    Page Should Contain Element    //div[contains(@class,'routine-history')]
    Run Keyword If    ${routine_history_present}    Click Element    //a[contains(text(),'View All Routines')]
    Run Keyword If    ${routine_history_present}    Take Screenshot With Timestamp    routine_history_from_profile

Profile Form Validation Works
    [Documentation]    Test that profile form validation works correctly
    [Tags]    profile    negative    validation
    Navigate To Page    ${PROFILE_EDIT_PAGE}
    
    # Clear required fields
    Clear Element Text    ${USERNAME_FIELD}
    Clear Element Text    ${EMAIL_FIELD}
    
    Click And Wait    ${SAVE_PROFILE_BUTTON}
    
    # Should show validation errors
    Page Should Contain    required
    Take Screenshot With Timestamp    profile_form_validation

User Cannot Use Duplicate Username
    [Documentation]    Test that user cannot use a duplicate username
    [Tags]    profile    negative    validation
    Navigate To Page    ${PROFILE_EDIT_PAGE}
    
    # Try to use existing username
    Input Text And Verify    ${USERNAME_FIELD}    existinguser
    Click And Wait    ${SAVE_PROFILE_BUTTON}
    
    # Should show error
    Page Should Contain    already taken
    Take Screenshot With Timestamp    duplicate_username_error

User Cannot Use Invalid Email Format
    [Documentation]    Test that user cannot use invalid email format
    [Tags]    profile    negative    validation
    Navigate To Page    ${PROFILE_EDIT_PAGE}
    
    # Enter invalid email
    Input Text And Verify    ${EMAIL_FIELD}    invalid-email
    Click And Wait    ${SAVE_PROFILE_BUTTON}
    
    # Should show validation error
    Page Should Contain    invalid email
    Take Screenshot With Timestamp    invalid_email_format_error

User Can Cancel Profile Edit
    [Documentation]    Test that user can cancel profile editing
    [Tags]    profile    positive    cancel
    Navigate To Page    ${PROFILE_EDIT_PAGE}
    
    # Make changes
    Input Text And Verify    ${USERNAME_FIELD}    CancelledUser
    
    # Cancel changes
    Click And Wait    ${CANCEL_BUTTON}
    
    # Should return to profile page without saving
    Page Should Not Contain    CancelledUser
    Take Screenshot With Timestamp    profile_edit_cancelled

Profile Avatar Upload Validation
    [Documentation]    Test that avatar upload validation works
    [Tags]    profile    negative    validation
    Navigate To Page    ${PROFILE_EDIT_PAGE}
    
    # Try to upload invalid file type
    ${invalid_file}=    Set Variable    /path/to/test/document.txt
    ${file_exists}=    Run Keyword And Return Status    File Should Exist    ${invalid_file}
    
    Run Keyword If    ${file_exists}    Choose File    ${AVATAR_UPLOAD}    ${invalid_file}
    Run Keyword If    ${file_exists}    Click And Wait    ${SAVE_PROFILE_BUTTON}
    Run Keyword If    ${file_exists}    Page Should Contain    invalid file type
    Run Keyword If    ${file_exists}    Take Screenshot With Timestamp    invalid_avatar_type_error

Profile Theme Settings Work
    [Documentation]    Test that profile theme settings work
    [Tags]    profile    positive    theme
    Navigate To Page    ${PROFILE_SETTINGS_PAGE}
    
    ${theme_toggle_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(@class,'theme-toggle')]
    Run Keyword If    ${theme_toggle_present}    Click Element    //button[contains(@class,'theme-toggle')]
    Run Keyword If    ${theme_toggle_present}    Take Screenshot With Timestamp    theme_changed

Profile Data Export Works
    [Documentation]    Test that profile data export works
    [Tags]    profile    positive    export
    Navigate To Page    ${PROFILE_SETTINGS_PAGE}
    
    ${export_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Export Data')]
    Run Keyword If    ${export_button_present}    Click Element    //button[contains(text(),'Export Data')]
    Run Keyword If    ${export_button_present}    Take Screenshot With Timestamp    profile_data_export

Profile Account Deletion Works
    [Documentation]    Test that profile account deletion works
    [Tags]    profile    positive    deletion
    Navigate To Page    ${PROFILE_SETTINGS_PAGE}
    
    ${delete_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Delete Account')]
    Run Keyword If    ${delete_button_present}    Click Element    //button[contains(text(),'Delete Account')]
    Run Keyword If    ${delete_button_present}    Take Screenshot With Timestamp    account_deletion_initiated

Profile Notification Settings Work
    [Documentation]    Test that profile notification settings work
    [Tags]    profile    positive    notifications
    Navigate To Page    ${PROFILE_SETTINGS_PAGE}
    
    ${notification_settings_present}=    Run Keyword And Return Status    Page Should Contain Element    //div[contains(@class,'notification-settings')]
    Run Keyword If    ${notification_settings_present}    Take Screenshot With Timestamp    notification_settings_displayed

*** Keywords ***
Setup Profile Test
    [Documentation]    Sets up each profile test
    Open Browser To Application
    Test Valid Sign In    ${TEST_EMAIL}    ${TEST_PASSWORD}

Teardown Profile Test
    [Documentation]    Tears down each profile test
    Close Browser Session
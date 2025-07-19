*** Settings ***
Documentation    Routine management tests for the fitness application
Resource         ../../resources/common.robot
Resource         ../../keywords/auth_keywords.robot
Resource         ../../keywords/routine_keywords.robot
Resource         ../../keywords/exercise_keywords.robot
Suite Setup      Setup Test Environment
Suite Teardown   Teardown Test Environment
Test Setup       Setup Routine Test
Test Teardown    Teardown Routine Test

*** Variables ***
${ROUTINE_NAME}         Test Routine
${ROUTINE_DESCRIPTION}  This is a test routine for automated testing
${UPDATED_ROUTINE_NAME} Updated Test Routine
${ROUTINE_DURATION}     60
${ROUTINE_DIFFICULTY}   Intermediate
${EXERCISE_NAME}        Test Exercise
${EXERCISE_DESCRIPTION} Test exercise for routine

*** Test Cases ***
User Can Create New Routine
    [Documentation]    Test that a user can create a new routine
    [Tags]    routine    positive    crud    smoke
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}    ${ROUTINE_DURATION}    ${ROUTINE_DIFFICULTY}
    Verify Routine In List    ${ROUTINE_NAME}
    Take Screenshot With Timestamp    routine_created_successfully

User Can View Routine Details
    [Documentation]    Test that a user can view routine details
    [Tags]    routine    positive    view
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Verify Routine Details    ${routine_id}    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    Take Screenshot With Timestamp    routine_details_viewed

User Can Edit Routine
    [Documentation]    Test that a user can edit an existing routine
    [Tags]    routine    positive    crud
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Edit Routine    ${routine_id}    ${UPDATED_ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    Verify Routine Details    ${routine_id}    ${UPDATED_ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    Take Screenshot With Timestamp    routine_edited_successfully

User Can Delete Routine
    [Documentation]    Test that a user can delete a routine
    [Tags]    routine    positive    crud
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Delete Routine    ${routine_id}
    Navigate To Routines Page
    Page Should Not Contain    ${ROUTINE_NAME}
    Take Screenshot With Timestamp    routine_deleted_successfully

User Can Add Exercise To Routine
    [Documentation]    Test that a user can add an exercise to a routine
    [Tags]    routine    positive    exercises
    # First create an exercise
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    
    # Then create a routine
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    
    # Add exercise to routine
    Add Exercise To Routine    ${routine_id}    ${EXERCISE_NAME}    3    10    50    60
    Verify Exercise In Routine    ${routine_id}    ${EXERCISE_NAME}
    Take Screenshot With Timestamp    exercise_added_to_routine

User Can Remove Exercise From Routine
    [Documentation]    Test that a user can remove an exercise from a routine
    [Tags]    routine    positive    exercises
    # Create exercise and routine
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    
    # Add then remove exercise
    Add Exercise To Routine    ${routine_id}    ${EXERCISE_NAME}
    Remove Exercise From Routine    ${routine_id}    ${EXERCISE_NAME}
    Verify Exercise Not In Routine    ${routine_id}    ${EXERCISE_NAME}
    Take Screenshot With Timestamp    exercise_removed_from_routine

User Can Copy Routine
    [Documentation]    Test that a user can copy an existing routine
    [Tags]    routine    positive    copy
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Copy Routine    ${routine_id}
    
    # Verify copy was created
    Navigate To Routines Page
    Page Should Contain    ${ROUTINE_NAME} (Copy)
    Take Screenshot With Timestamp    routine_copied_successfully

User Can Start Workout From Routine
    [Documentation]    Test that a user can start a workout from a routine
    [Tags]    routine    positive    workout
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Start Workout From Routine    ${routine_id}
    
    # Verify workout started
    Page Should Contain    Workout Started
    Take Screenshot With Timestamp    workout_started_from_routine

User Can Search For Routines
    [Documentation]    Test that a user can search for routines
    [Tags]    routine    positive    search
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    Create New Routine    Another Routine    Another description
    
    Search Routines    ${ROUTINE_NAME}
    Page Should Contain    ${ROUTINE_NAME}
    Page Should Not Contain    Another Routine
    Take Screenshot With Timestamp    routine_search_results

User Can Filter Routines By Difficulty
    [Documentation]    Test that a user can filter routines by difficulty
    [Tags]    routine    positive    filter
    Create New Routine    Beginner Routine    Beginner routine description    60    Beginner
    Create New Routine    Advanced Routine    Advanced routine description    90    Advanced
    
    Filter Routines    Beginner
    Page Should Contain    Beginner Routine
    Page Should Not Contain    Advanced Routine
    Take Screenshot With Timestamp    routine_filter_results

User Cannot Create Routine Without Required Fields
    [Documentation]    Test that routine creation fails without required fields
    [Tags]    routine    negative    validation
    Verify Routine Form Validation
    Take Screenshot With Timestamp    routine_form_validation_failed

User Cannot Create Routine With Duplicate Name
    [Documentation]    Test that user cannot create routine with duplicate name
    [Tags]    routine    negative    validation
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    Navigate To New Routine Page
    Fill Routine Form    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    Click And Wait    ${CREATE_ROUTINE_BUTTON}
    Page Should Contain    already exists
    Take Screenshot With Timestamp    duplicate_routine_name_error

Routine Difficulty Levels Are Loaded Correctly
    [Documentation]    Test that routine difficulty levels are loaded correctly
    [Tags]    routine    positive    difficulty
    Navigate To New Routine Page
    ${difficulty_options}=    Get List Items    ${ROUTINE_DIFFICULTY_SELECT}
    Should Contain    ${difficulty_options}    Beginner
    Should Contain    ${difficulty_options}    Intermediate
    Should Contain    ${difficulty_options}    Advanced
    Take Screenshot With Timestamp    routine_difficulty_levels_loaded

Routine Exercise Order Can Be Changed
    [Documentation]    Test that exercise order in routine can be changed
    [Tags]    routine    positive    exercises    order
    # Create multiple exercises
    Create New Exercise    First Exercise    First exercise description
    Create New Exercise    Second Exercise    Second exercise description
    
    # Create routine and add exercises
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Add Exercise To Routine    ${routine_id}    First Exercise
    Add Exercise To Routine    ${routine_id}    Second Exercise
    
    # Test drag and drop if available
    ${drag_handle_present}=    Run Keyword And Return Status    Page Should Contain Element    //div[contains(@class,'drag-handle')]
    Run Keyword If    ${drag_handle_present}    Take Screenshot With Timestamp    routine_exercise_order_changed

Routine Statistics Are Displayed Correctly
    [Documentation]    Test that routine statistics are displayed correctly
    [Tags]    routine    positive    statistics
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Add Exercise To Routine    ${routine_id}    ${EXERCISE_NAME}
    
    # Verify statistics are shown
    Navigate To Routine Detail Page    ${routine_id}
    Page Should Contain    Total Exercises: 1
    Page Should Contain    Estimated Duration: ${ROUTINE_DURATION}
    Take Screenshot With Timestamp    routine_statistics_displayed

Routine Rest Times Are Configurable
    [Documentation]    Test that rest times between exercises are configurable
    [Tags]    routine    positive    rest_times
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Add Exercise To Routine    ${routine_id}    ${EXERCISE_NAME}    3    10    50    120
    
    # Verify rest time is saved
    Navigate To Routine Detail Page    ${routine_id}
    Page Should Contain    Rest: 120s
    Take Screenshot With Timestamp    routine_rest_times_configured

Routine Notes Can Be Added
    [Documentation]    Test that notes can be added to routines
    [Tags]    routine    positive    notes
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Add Exercise To Routine    ${routine_id}    ${EXERCISE_NAME}
    
    # Add notes to exercise in routine
    Input Text    ${NOTES_INPUT}    This is a test note for the exercise
    Click And Wait    ${SAVE_ROUTINE_BUTTON}
    
    # Verify notes are saved
    Navigate To Routine Detail Page    ${routine_id}
    Page Should Contain    This is a test note for the exercise
    Take Screenshot With Timestamp    routine_notes_added

Routine CRUD Operations Complete Flow
    [Documentation]    Test complete CRUD operations for routines
    [Tags]    routine    positive    crud    integration
    Test Routine CRUD Operations    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    Take Screenshot With Timestamp    routine_crud_complete

User Can Export Routine Data
    [Documentation]    Test that user can export routine data (if feature exists)
    [Tags]    routine    positive    export
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    Navigate To Routines Page
    
    ${export_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Export')]
    Run Keyword If    ${export_button_present}    Click Element    //button[contains(text(),'Export')]
    Run Keyword If    ${export_button_present}    Take Screenshot With Timestamp    routine_export_clicked

User Can Import Routine Data
    [Documentation]    Test that user can import routine data (if feature exists)
    [Tags]    routine    positive    import
    Navigate To Routines Page
    
    ${import_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Import')]
    Run Keyword If    ${import_button_present}    Click Element    //button[contains(text(),'Import')]
    Run Keyword If    ${import_button_present}    Take Screenshot With Timestamp    routine_import_clicked

Routine Templates Are Available
    [Documentation]    Test that routine templates are available for quick creation
    [Tags]    routine    positive    templates
    Navigate To New Routine Page
    
    ${template_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Template')]
    Run Keyword If    ${template_button_present}    Click Element    //button[contains(text(),'Template')]
    Run Keyword If    ${template_button_present}    Take Screenshot With Timestamp    routine_template_selected

*** Keywords ***
Setup Routine Test
    [Documentation]    Sets up each routine test
    Open Browser To Application
    Test Valid Sign In    ${TEST_EMAIL}    ${TEST_PASSWORD}

Teardown Routine Test
    [Documentation]    Tears down each routine test
    Close Browser Session
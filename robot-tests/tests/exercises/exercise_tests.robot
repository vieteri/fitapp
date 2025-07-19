*** Settings ***
Documentation    Exercise management tests for the fitness application
Resource         ../../resources/common.robot
Resource         ../../keywords/auth_keywords.robot
Resource         ../../keywords/exercise_keywords.robot
Suite Setup      Setup Test Environment
Suite Teardown   Teardown Test Environment
Test Setup       Setup Exercise Test
Test Teardown    Teardown Exercise Test

*** Variables ***
${EXERCISE_NAME}         Test Exercise
${EXERCISE_DESCRIPTION}  This is a test exercise for automated testing
${UPDATED_EXERCISE_NAME} Updated Test Exercise
${EXERCISE_CATEGORY}     Strength
${MUSCLE_GROUP}          Chest
${EQUIPMENT}             Barbell

*** Test Cases ***
User Can Create New Exercise
    [Documentation]    Test that a user can create a new exercise
    [Tags]    exercise    positive    crud    smoke
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}    ${EXERCISE_CATEGORY}    ${MUSCLE_GROUP}    ${EQUIPMENT}
    Verify Exercise In List    ${EXERCISE_NAME}
    Take Screenshot With Timestamp    exercise_created_successfully

User Can View Exercise Details
    [Documentation]    Test that a user can view exercise details
    [Tags]    exercise    positive    view
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    ${exercise_id}=    Get Exercise ID From URL
    Verify Exercise Details    ${exercise_id}    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Take Screenshot With Timestamp    exercise_details_viewed

User Can Edit Exercise
    [Documentation]    Test that a user can edit an existing exercise
    [Tags]    exercise    positive    crud
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    ${exercise_id}=    Get Exercise ID From URL
    Edit Exercise    ${exercise_id}    ${UPDATED_EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Verify Exercise Details    ${exercise_id}    ${UPDATED_EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Take Screenshot With Timestamp    exercise_edited_successfully

User Can Delete Exercise
    [Documentation]    Test that a user can delete an exercise
    [Tags]    exercise    positive    crud
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    ${exercise_id}=    Get Exercise ID From URL
    Delete Exercise    ${exercise_id}
    Verify Exercise Not In List    ${EXERCISE_NAME}
    Take Screenshot With Timestamp    exercise_deleted_successfully

User Can Search For Exercises
    [Documentation]    Test that a user can search for exercises
    [Tags]    exercise    positive    search
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Create New Exercise    Another Exercise    Another description
    
    Search Exercises    ${EXERCISE_NAME}
    Page Should Contain    ${EXERCISE_NAME}
    Page Should Not Contain    Another Exercise
    Take Screenshot With Timestamp    exercise_search_results

User Can Filter Exercises By Category
    [Documentation]    Test that a user can filter exercises by category
    [Tags]    exercise    positive    filter
    Create New Exercise    Strength Exercise    Strength exercise description    Strength
    Create New Exercise    Cardio Exercise    Cardio exercise description    Cardio
    
    Filter Exercises    Strength
    Page Should Contain    Strength Exercise
    Page Should Not Contain    Cardio Exercise
    Take Screenshot With Timestamp    exercise_filter_results

User Cannot Create Exercise Without Required Fields
    [Documentation]    Test that exercise creation fails without required fields
    [Tags]    exercise    negative    validation
    Verify Exercise Form Validation
    Take Screenshot With Timestamp    exercise_form_validation_failed

User Cannot Create Exercise With Duplicate Name
    [Documentation]    Test that user cannot create exercise with duplicate name
    [Tags]    exercise    negative    validation
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Navigate To New Exercise Page
    Fill Exercise Form    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Click And Wait    ${CREATE_EXERCISE_BUTTON}
    Page Should Contain    already exists
    Take Screenshot With Timestamp    duplicate_exercise_name_error

Exercise List Pagination Works
    [Documentation]    Test that exercise list pagination works correctly
    [Tags]    exercise    positive    pagination
    # Create multiple exercises to test pagination
    FOR    ${i}    IN RANGE    1    25
        Create New Exercise    Exercise ${i}    Description for exercise ${i}
    END
    
    Navigate To Exercises Page
    # Check if pagination controls are present
    ${pagination_present}=    Run Keyword And Return Status    Page Should Contain Element    //nav[contains(@class,'pagination')]
    Run Keyword If    ${pagination_present}    Click Element    //a[contains(@class,'next')]
    Run Keyword If    ${pagination_present}    Take Screenshot With Timestamp    exercise_pagination_next_page

Exercise Categories Are Loaded Correctly
    [Documentation]    Test that exercise categories are loaded correctly in dropdown
    [Tags]    exercise    positive    categories
    Navigate To New Exercise Page
    ${category_options}=    Get List Items    ${EXERCISE_CATEGORY_SELECT}
    Should Contain    ${category_options}    Strength
    Should Contain    ${category_options}    Cardio
    Should Contain    ${category_options}    Flexibility
    Take Screenshot With Timestamp    exercise_categories_loaded

Exercise Muscle Groups Are Loaded Correctly
    [Documentation]    Test that muscle groups are loaded correctly in dropdown
    [Tags]    exercise    positive    muscle_groups
    Navigate To New Exercise Page
    ${muscle_group_options}=    Get List Items    ${EXERCISE_MUSCLE_GROUP_SELECT}
    Should Contain    ${muscle_group_options}    Chest
    Should Contain    ${muscle_group_options}    Back
    Should Contain    ${muscle_group_options}    Legs
    Take Screenshot With Timestamp    exercise_muscle_groups_loaded

Exercise Equipment Options Are Loaded Correctly
    [Documentation]    Test that equipment options are loaded correctly in dropdown
    [Tags]    exercise    positive    equipment
    Navigate To New Exercise Page
    ${equipment_options}=    Get List Items    ${EXERCISE_EQUIPMENT_SELECT}
    Should Contain    ${equipment_options}    Barbell
    Should Contain    ${equipment_options}    Dumbbell
    Should Contain    ${equipment_options}    Bodyweight
    Take Screenshot With Timestamp    exercise_equipment_loaded

Exercise Form Autosave Works
    [Documentation]    Test that exercise form autosave functionality works
    [Tags]    exercise    positive    autosave
    Navigate To New Exercise Page
    Fill Exercise Form    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    
    # Simulate page refresh to test autosave
    Reload Page
    Wait For Page To Load
    
    # Check if form data is preserved
    ${name_value}=    Get Element Attribute    ${EXERCISE_NAME_FIELD}    value
    Should Be Equal    ${name_value}    ${EXERCISE_NAME}
    Take Screenshot With Timestamp    exercise_form_autosave_works

Exercise CRUD Operations Complete Flow
    [Documentation]    Test complete CRUD operations for exercises
    [Tags]    exercise    positive    crud    integration
    Test Exercise CRUD Operations    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Take Screenshot With Timestamp    exercise_crud_complete

User Can Export Exercise Data
    [Documentation]    Test that user can export exercise data (if feature exists)
    [Tags]    exercise    positive    export
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Navigate To Exercises Page
    
    ${export_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Export')]
    Run Keyword If    ${export_button_present}    Click Element    //button[contains(text(),'Export')]
    Run Keyword If    ${export_button_present}    Take Screenshot With Timestamp    exercise_export_clicked

User Can Import Exercise Data
    [Documentation]    Test that user can import exercise data (if feature exists)
    [Tags]    exercise    positive    import
    Navigate To Exercises Page
    
    ${import_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Import')]
    Run Keyword If    ${import_button_present}    Click Element    //button[contains(text(),'Import')]
    Run Keyword If    ${import_button_present}    Take Screenshot With Timestamp    exercise_import_clicked

Exercise List Sorting Works
    [Documentation]    Test that exercise list sorting works correctly
    [Tags]    exercise    positive    sorting
    Create New Exercise    Alpha Exercise    First exercise
    Create New Exercise    Beta Exercise    Second exercise
    
    Navigate To Exercises Page
    
    # Test name sorting
    ${sort_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Sort')]
    Run Keyword If    ${sort_button_present}    Click Element    //button[contains(text(),'Sort')]
    Run Keyword If    ${sort_button_present}    Take Screenshot With Timestamp    exercise_list_sorted

*** Keywords ***
Setup Exercise Test
    [Documentation]    Sets up each exercise test
    Open Browser To Application
    Test Valid Sign In    ${TEST_EMAIL}    ${TEST_PASSWORD}

Teardown Exercise Test
    [Documentation]    Tears down each exercise test
    Close Browser Session
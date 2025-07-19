*** Settings ***
Resource    ../resources/common.robot

*** Variables ***
# Exercise page selectors
${EXERCISES_PAGE}         /exercises
${NEW_EXERCISE_PAGE}      /exercises/new
${EXERCISE_DETAIL_PAGE}   /exercises/

${EXERCISE_NAME_FIELD}    //input[@name='name']
${EXERCISE_DESCRIPTION_FIELD}    //textarea[@name='description']
${EXERCISE_CATEGORY_SELECT}      //select[@name='category']
${EXERCISE_MUSCLE_GROUP_SELECT}  //select[@name='muscleGroup']
${EXERCISE_EQUIPMENT_SELECT}     //select[@name='equipment']

${CREATE_EXERCISE_BUTTON}     //button[contains(text(),'Create Exercise')]
${EDIT_EXERCISE_BUTTON}       //button[contains(text(),'Edit Exercise')]
${DELETE_EXERCISE_BUTTON}     //button[contains(text(),'Delete Exercise')]
${SAVE_EXERCISE_BUTTON}       //button[contains(text(),'Save Exercise')]

${EXERCISE_LIST_ITEM}         //div[contains(@class,'exercise-item')]
${EXERCISE_CARD}              //div[contains(@class,'exercise-card')]
${EXERCISE_SEARCH_FIELD}      //input[@placeholder='Search exercises...']
${EXERCISE_FILTER_DROPDOWN}   //select[contains(@class,'filter')]

${EXERCISE_NAME_DISPLAY}      //h1[contains(@class,'exercise-name')]
${EXERCISE_DESCRIPTION_DISPLAY}  //div[contains(@class,'exercise-description')]

*** Keywords ***
Navigate To Exercises Page
    [Documentation]    Navigates to the exercises page
    Navigate To Page    ${EXERCISES_PAGE}
    Wait For Element And Take Screenshot    ${EXERCISE_LIST_ITEM}    exercises_page

Navigate To New Exercise Page
    [Documentation]    Navigates to the new exercise page
    Navigate To Page    ${NEW_EXERCISE_PAGE}
    Wait For Element And Take Screenshot    ${CREATE_EXERCISE_BUTTON}    new_exercise_page

Navigate To Exercise Detail Page
    [Documentation]    Navigates to a specific exercise detail page
    [Arguments]    ${exercise_id}
    Navigate To Page    ${EXERCISE_DETAIL_PAGE}${exercise_id}
    Wait For Element And Take Screenshot    ${EXERCISE_NAME_DISPLAY}    exercise_detail_page

Fill Exercise Form
    [Documentation]    Fills the exercise form with provided data
    [Arguments]    ${name}    ${description}    ${category}=Strength    ${muscle_group}=Chest    ${equipment}=Barbell
    Input Text And Verify    ${EXERCISE_NAME_FIELD}    ${name}
    Input Text And Verify    ${EXERCISE_DESCRIPTION_FIELD}    ${description}
    Select From List By Label    ${EXERCISE_CATEGORY_SELECT}    ${category}
    Select From List By Label    ${EXERCISE_MUSCLE_GROUP_SELECT}    ${muscle_group}
    Select From List By Label    ${EXERCISE_EQUIPMENT_SELECT}    ${equipment}
    Take Screenshot With Timestamp    exercise_form_filled

Create New Exercise
    [Documentation]    Creates a new exercise
    [Arguments]    ${name}    ${description}    ${category}=Strength    ${muscle_group}=Chest    ${equipment}=Barbell
    Navigate To New Exercise Page
    Fill Exercise Form    ${name}    ${description}    ${category}    ${muscle_group}    ${equipment}
    Click And Wait    ${CREATE_EXERCISE_BUTTON}
    Take Screenshot With Timestamp    exercise_created

Edit Exercise
    [Documentation]    Edits an existing exercise
    [Arguments]    ${exercise_id}    ${name}    ${description}    ${category}=Strength    ${muscle_group}=Chest    ${equipment}=Barbell
    Navigate To Exercise Detail Page    ${exercise_id}
    Click And Wait    ${EDIT_EXERCISE_BUTTON}
    Fill Exercise Form    ${name}    ${description}    ${category}    ${muscle_group}    ${equipment}
    Click And Wait    ${SAVE_EXERCISE_BUTTON}
    Take Screenshot With Timestamp    exercise_edited

Delete Exercise
    [Documentation]    Deletes an exercise
    [Arguments]    ${exercise_id}
    Navigate To Exercise Detail Page    ${exercise_id}
    Click And Wait    ${DELETE_EXERCISE_BUTTON}
    # Handle confirmation dialog if present
    ${alert_present}=    Run Keyword And Return Status    Alert Should Be Present
    Run Keyword If    ${alert_present}    Accept Alert
    Take Screenshot With Timestamp    exercise_deleted

Search Exercises
    [Documentation]    Searches for exercises
    [Arguments]    ${search_term}
    Navigate To Exercises Page
    Input Text And Verify    ${EXERCISE_SEARCH_FIELD}    ${search_term}
    Wait For Page To Load
    Take Screenshot With Timestamp    exercise_search_results

Filter Exercises
    [Documentation]    Filters exercises by category
    [Arguments]    ${filter_value}
    Navigate To Exercises Page
    Select From List By Label    ${EXERCISE_FILTER_DROPDOWN}    ${filter_value}
    Wait For Page To Load
    Take Screenshot With Timestamp    exercise_filter_results

Verify Exercise In List
    [Documentation]    Verifies an exercise appears in the list
    [Arguments]    ${exercise_name}
    Navigate To Exercises Page
    Page Should Contain    ${exercise_name}
    Take Screenshot With Timestamp    exercise_in_list

Verify Exercise Details
    [Documentation]    Verifies exercise details on detail page
    [Arguments]    ${exercise_id}    ${expected_name}    ${expected_description}
    Navigate To Exercise Detail Page    ${exercise_id}
    Verify Element Contains Text    ${EXERCISE_NAME_DISPLAY}    ${expected_name}
    Verify Element Contains Text    ${EXERCISE_DESCRIPTION_DISPLAY}    ${expected_description}
    Take Screenshot With Timestamp    exercise_details_verified

Verify Exercise Not In List
    [Documentation]    Verifies an exercise does not appear in the list
    [Arguments]    ${exercise_name}
    Navigate To Exercises Page
    Page Should Not Contain    ${exercise_name}
    Take Screenshot With Timestamp    exercise_not_in_list

Count Exercises In List
    [Documentation]    Counts the number of exercises in the list
    Navigate To Exercises Page
    ${count}=    Get Element Count    ${EXERCISE_LIST_ITEM}
    Take Screenshot With Timestamp    exercise_count
    [Return]    ${count}

Verify Exercise Form Validation
    [Documentation]    Verifies form validation for required fields
    Navigate To New Exercise Page
    Click And Wait    ${CREATE_EXERCISE_BUTTON}
    # Should show validation errors
    Page Should Contain    required
    Take Screenshot With Timestamp    exercise_form_validation

Test Exercise CRUD Operations
    [Documentation]    Tests complete CRUD operations for exercises
    [Arguments]    ${exercise_name}    ${exercise_description}
    # Create
    Create New Exercise    ${exercise_name}    ${exercise_description}
    Verify Exercise In List    ${exercise_name}
    
    # Read
    ${exercise_id}=    Get Exercise ID From URL
    Verify Exercise Details    ${exercise_id}    ${exercise_name}    ${exercise_description}
    
    # Update
    ${updated_name}=    Set Variable    ${exercise_name} Updated
    Edit Exercise    ${exercise_id}    ${updated_name}    ${exercise_description}
    Verify Exercise Details    ${exercise_id}    ${updated_name}    ${exercise_description}
    
    # Delete
    Delete Exercise    ${exercise_id}
    Verify Exercise Not In List    ${updated_name}

Get Exercise ID From URL
    [Documentation]    Extracts exercise ID from current URL
    ${current_url}=    Get Location
    ${exercise_id}=    Get Regexp Matches    ${current_url}    /exercises/([0-9]+)    1
    [Return]    ${exercise_id}[0]
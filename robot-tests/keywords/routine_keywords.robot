*** Settings ***
Resource    ../resources/common.robot

*** Variables ***
# Routine page selectors
${ROUTINES_PAGE}          /routines
${NEW_ROUTINE_PAGE}       /routines/new
${ROUTINE_DETAIL_PAGE}    /routines/

${ROUTINE_NAME_FIELD}     //input[@name='name']
${ROUTINE_DESCRIPTION_FIELD}    //textarea[@name='description']
${ROUTINE_DURATION_FIELD}       //input[@name='duration']
${ROUTINE_DIFFICULTY_SELECT}    //select[@name='difficulty']

${CREATE_ROUTINE_BUTTON}      //button[contains(text(),'Create Routine')]
${EDIT_ROUTINE_BUTTON}        //button[contains(text(),'Edit Routine')]
${DELETE_ROUTINE_BUTTON}      //button[contains(text(),'Delete Routine')]
${SAVE_ROUTINE_BUTTON}        //button[contains(text(),'Save Routine')]
${COPY_ROUTINE_BUTTON}        //button[contains(text(),'Copy Routine')]
${START_WORKOUT_BUTTON}       //button[contains(text(),'Start Workout')]

${ADD_EXERCISE_BUTTON}        //button[contains(text(),'Add Exercise')]
${REMOVE_EXERCISE_BUTTON}     //button[contains(text(),'Remove Exercise')]
${EXERCISE_SEARCH_MODAL}      //div[contains(@class,'modal')]
${EXERCISE_SELECT_CHECKBOX}   //input[@type='checkbox']

${ROUTINE_LIST_ITEM}          //div[contains(@class,'routine-item')]
${ROUTINE_CARD}               //div[contains(@class,'routine-card')]
${ROUTINE_SEARCH_FIELD}       //input[@placeholder='Search routines...']
${ROUTINE_FILTER_DROPDOWN}    //select[contains(@class,'filter')]

${ROUTINE_NAME_DISPLAY}       //h1[contains(@class,'routine-name')]
${ROUTINE_DESCRIPTION_DISPLAY}  //div[contains(@class,'routine-description')]
${ROUTINE_EXERCISES_LIST}     //div[contains(@class,'routine-exercises')]
${EXERCISE_IN_ROUTINE}        //div[contains(@class,'exercise-in-routine')]

# Sets and reps inputs
${SETS_INPUT}                 //input[@name='sets']
${REPS_INPUT}                 //input[@name='reps']
${WEIGHT_INPUT}               //input[@name='weight']
${REST_TIME_INPUT}            //input[@name='restTime']
${NOTES_INPUT}                //textarea[@name='notes']

*** Keywords ***
Navigate To Routines Page
    [Documentation]    Navigates to the routines page
    Navigate To Page    ${ROUTINES_PAGE}
    Wait For Element And Take Screenshot    ${ROUTINE_LIST_ITEM}    routines_page

Navigate To New Routine Page
    [Documentation]    Navigates to the new routine page
    Navigate To Page    ${NEW_ROUTINE_PAGE}
    Wait For Element And Take Screenshot    ${CREATE_ROUTINE_BUTTON}    new_routine_page

Navigate To Routine Detail Page
    [Documentation]    Navigates to a specific routine detail page
    [Arguments]    ${routine_id}
    Navigate To Page    ${ROUTINE_DETAIL_PAGE}${routine_id}
    Wait For Element And Take Screenshot    ${ROUTINE_NAME_DISPLAY}    routine_detail_page

Fill Routine Form
    [Documentation]    Fills the routine form with provided data
    [Arguments]    ${name}    ${description}    ${duration}=60    ${difficulty}=Intermediate
    Input Text And Verify    ${ROUTINE_NAME_FIELD}    ${name}
    Input Text And Verify    ${ROUTINE_DESCRIPTION_FIELD}    ${description}
    Input Text And Verify    ${ROUTINE_DURATION_FIELD}    ${duration}
    Select From List By Label    ${ROUTINE_DIFFICULTY_SELECT}    ${difficulty}
    Take Screenshot With Timestamp    routine_form_filled

Create New Routine
    [Documentation]    Creates a new routine
    [Arguments]    ${name}    ${description}    ${duration}=60    ${difficulty}=Intermediate
    Navigate To New Routine Page
    Fill Routine Form    ${name}    ${description}    ${duration}    ${difficulty}
    Click And Wait    ${CREATE_ROUTINE_BUTTON}
    Take Screenshot With Timestamp    routine_created

Add Exercise To Routine
    [Documentation]    Adds an exercise to a routine
    [Arguments]    ${routine_id}    ${exercise_name}    ${sets}=3    ${reps}=10    ${weight}=50    ${rest_time}=60
    Navigate To Routine Detail Page    ${routine_id}
    Click And Wait    ${ADD_EXERCISE_BUTTON}
    
    # Wait for modal to appear
    Wait Until Element Is Visible    ${EXERCISE_SEARCH_MODAL}
    
    # Search for exercise
    Input Text    ${EXERCISE_SEARCH_FIELD}    ${exercise_name}
    Wait For Page To Load
    
    # Select exercise
    Click Element    ${EXERCISE_SELECT_CHECKBOX}
    Click And Wait    //button[contains(text(),'Add Selected')]
    
    # Configure sets, reps, weight, and rest time
    Input Text And Verify    ${SETS_INPUT}    ${sets}
    Input Text And Verify    ${REPS_INPUT}    ${reps}
    Input Text And Verify    ${WEIGHT_INPUT}    ${weight}
    Input Text And Verify    ${REST_TIME_INPUT}    ${rest_time}
    
    Take Screenshot With Timestamp    exercise_added_to_routine

Remove Exercise From Routine
    [Documentation]    Removes an exercise from a routine
    [Arguments]    ${routine_id}    ${exercise_name}
    Navigate To Routine Detail Page    ${routine_id}
    ${exercise_element}=    Get WebElement    //div[contains(text(),'${exercise_name}')]
    Click Element    ${exercise_element}/..//${REMOVE_EXERCISE_BUTTON}
    Take Screenshot With Timestamp    exercise_removed_from_routine

Edit Routine
    [Documentation]    Edits an existing routine
    [Arguments]    ${routine_id}    ${name}    ${description}    ${duration}=60    ${difficulty}=Intermediate
    Navigate To Routine Detail Page    ${routine_id}
    Click And Wait    ${EDIT_ROUTINE_BUTTON}
    Fill Routine Form    ${name}    ${description}    ${duration}    ${difficulty}
    Click And Wait    ${SAVE_ROUTINE_BUTTON}
    Take Screenshot With Timestamp    routine_edited

Copy Routine
    [Documentation]    Copies an existing routine
    [Arguments]    ${routine_id}
    Navigate To Routine Detail Page    ${routine_id}
    Click And Wait    ${COPY_ROUTINE_BUTTON}
    Take Screenshot With Timestamp    routine_copied

Delete Routine
    [Documentation]    Deletes a routine
    [Arguments]    ${routine_id}
    Navigate To Routine Detail Page    ${routine_id}
    Click And Wait    ${DELETE_ROUTINE_BUTTON}
    # Handle confirmation dialog if present
    ${alert_present}=    Run Keyword And Return Status    Alert Should Be Present
    Run Keyword If    ${alert_present}    Accept Alert
    Take Screenshot With Timestamp    routine_deleted

Start Workout From Routine
    [Documentation]    Starts a workout from a routine
    [Arguments]    ${routine_id}
    Navigate To Routine Detail Page    ${routine_id}
    Click And Wait    ${START_WORKOUT_BUTTON}
    Take Screenshot With Timestamp    workout_started_from_routine

Search Routines
    [Documentation]    Searches for routines
    [Arguments]    ${search_term}
    Navigate To Routines Page
    Input Text And Verify    ${ROUTINE_SEARCH_FIELD}    ${search_term}
    Wait For Page To Load
    Take Screenshot With Timestamp    routine_search_results

Filter Routines
    [Documentation]    Filters routines by difficulty
    [Arguments]    ${filter_value}
    Navigate To Routines Page
    Select From List By Label    ${ROUTINE_FILTER_DROPDOWN}    ${filter_value}
    Wait For Page To Load
    Take Screenshot With Timestamp    routine_filter_results

Verify Routine In List
    [Documentation]    Verifies a routine appears in the list
    [Arguments]    ${routine_name}
    Navigate To Routines Page
    Page Should Contain    ${routine_name}
    Take Screenshot With Timestamp    routine_in_list

Verify Routine Details
    [Documentation]    Verifies routine details on detail page
    [Arguments]    ${routine_id}    ${expected_name}    ${expected_description}
    Navigate To Routine Detail Page    ${routine_id}
    Verify Element Contains Text    ${ROUTINE_NAME_DISPLAY}    ${expected_name}
    Verify Element Contains Text    ${ROUTINE_DESCRIPTION_DISPLAY}    ${expected_description}
    Take Screenshot With Timestamp    routine_details_verified

Verify Exercise In Routine
    [Documentation]    Verifies an exercise is in the routine
    [Arguments]    ${routine_id}    ${exercise_name}
    Navigate To Routine Detail Page    ${routine_id}
    Page Should Contain    ${exercise_name}
    Take Screenshot With Timestamp    exercise_in_routine_verified

Verify Exercise Not In Routine
    [Documentation]    Verifies an exercise is not in the routine
    [Arguments]    ${routine_id}    ${exercise_name}
    Navigate To Routine Detail Page    ${routine_id}
    Page Should Not Contain    ${exercise_name}
    Take Screenshot With Timestamp    exercise_not_in_routine_verified

Count Routines In List
    [Documentation]    Counts the number of routines in the list
    Navigate To Routines Page
    ${count}=    Get Element Count    ${ROUTINE_LIST_ITEM}
    Take Screenshot With Timestamp    routine_count
    [Return]    ${count}

Count Exercises In Routine
    [Documentation]    Counts the number of exercises in a routine
    [Arguments]    ${routine_id}
    Navigate To Routine Detail Page    ${routine_id}
    ${count}=    Get Element Count    ${EXERCISE_IN_ROUTINE}
    Take Screenshot With Timestamp    routine_exercise_count
    [Return]    ${count}

Verify Routine Form Validation
    [Documentation]    Verifies form validation for required fields
    Navigate To New Routine Page
    Click And Wait    ${CREATE_ROUTINE_BUTTON}
    # Should show validation errors
    Page Should Contain    required
    Take Screenshot With Timestamp    routine_form_validation

Test Routine CRUD Operations
    [Documentation]    Tests complete CRUD operations for routines
    [Arguments]    ${routine_name}    ${routine_description}
    # Create
    Create New Routine    ${routine_name}    ${routine_description}
    Verify Routine In List    ${routine_name}
    
    # Read
    ${routine_id}=    Get Routine ID From URL
    Verify Routine Details    ${routine_id}    ${routine_name}    ${routine_description}
    
    # Update
    ${updated_name}=    Set Variable    ${routine_name} Updated
    Edit Routine    ${routine_id}    ${updated_name}    ${routine_description}
    Verify Routine Details    ${routine_id}    ${updated_name}    ${routine_description}
    
    # Delete
    Delete Routine    ${routine_id}
    Navigate To Routines Page
    Page Should Not Contain    ${updated_name}

Get Routine ID From URL
    [Documentation]    Extracts routine ID from current URL
    ${current_url}=    Get Location
    ${routine_id}=    Get Regexp Matches    ${current_url}    /routines/([0-9]+)    1
    [Return]    ${routine_id}[0]
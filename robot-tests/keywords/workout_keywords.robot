*** Settings ***
Resource    ../resources/common.robot

*** Variables ***
# Workout page selectors
${WORKOUTS_PAGE}          /workouts
${NEW_WORKOUT_PAGE}       /workouts/new
${WORKOUT_DETAIL_PAGE}    /workouts/
${WORKOUT_HISTORY_PAGE}   /workouts/history

${WORKOUT_NAME_FIELD}     //input[@name='name']
${WORKOUT_NOTES_FIELD}    //textarea[@name='notes']
${WORKOUT_DATE_FIELD}     //input[@name='date']
${WORKOUT_DURATION_FIELD} //input[@name='duration']

${START_WORKOUT_BUTTON}   //button[contains(text(),'Start Workout')]
${PAUSE_WORKOUT_BUTTON}   //button[contains(text(),'Pause Workout')]
${RESUME_WORKOUT_BUTTON}  //button[contains(text(),'Resume Workout')]
${FINISH_WORKOUT_BUTTON}  //button[contains(text(),'Finish Workout')]
${SAVE_WORKOUT_BUTTON}    //button[contains(text(),'Save Workout')]
${DELETE_WORKOUT_BUTTON}  //button[contains(text(),'Delete Workout')]

${ADD_EXERCISE_TO_WORKOUT_BUTTON}  //button[contains(text(),'Add Exercise')]
${REMOVE_EXERCISE_FROM_WORKOUT}    //button[contains(text(),'Remove')]
${NEXT_EXERCISE_BUTTON}            //button[contains(text(),'Next Exercise')]
${PREVIOUS_EXERCISE_BUTTON}        //button[contains(text(),'Previous Exercise')]

${WORKOUT_LIST_ITEM}      //div[contains(@class,'workout-item')]
${WORKOUT_CARD}           //div[contains(@class,'workout-card')]
${WORKOUT_SEARCH_FIELD}   //input[@placeholder='Search workouts...']
${WORKOUT_FILTER_DROPDOWN} //select[contains(@class,'filter')]

${WORKOUT_NAME_DISPLAY}   //h1[contains(@class,'workout-name')]
${WORKOUT_STATUS_DISPLAY} //div[contains(@class,'workout-status')]
${WORKOUT_TIMER_DISPLAY}  //div[contains(@class,'workout-timer')]
${WORKOUT_EXERCISES_LIST} //div[contains(@class,'workout-exercises')]

# Exercise tracking inputs
${EXERCISE_SET_INPUT}     //input[@name='set']
${EXERCISE_REPS_INPUT}    //input[@name='reps']
${EXERCISE_WEIGHT_INPUT}  //input[@name='weight']
${EXERCISE_REST_TIMER}    //div[contains(@class,'rest-timer')]
${EXERCISE_NOTES_INPUT}   //textarea[@name='exerciseNotes']

${COMPLETE_SET_BUTTON}    //button[contains(text(),'Complete Set')]
${SKIP_SET_BUTTON}        //button[contains(text(),'Skip Set')]
${ADD_SET_BUTTON}         //button[contains(text(),'Add Set')]

# Timer controls
${START_REST_TIMER_BUTTON}  //button[contains(text(),'Start Rest Timer')]
${PAUSE_REST_TIMER_BUTTON}  //button[contains(text(),'Pause Rest Timer')]
${SKIP_REST_TIMER_BUTTON}   //button[contains(text(),'Skip Rest')]

*** Keywords ***
Navigate To Workouts Page
    [Documentation]    Navigates to the workouts page
    Navigate To Page    ${WORKOUTS_PAGE}
    Wait For Element And Take Screenshot    ${WORKOUT_LIST_ITEM}    workouts_page

Navigate To New Workout Page
    [Documentation]    Navigates to the new workout page
    Navigate To Page    ${NEW_WORKOUT_PAGE}
    Wait For Element And Take Screenshot    ${START_WORKOUT_BUTTON}    new_workout_page

Navigate To Workout Detail Page
    [Documentation]    Navigates to a specific workout detail page
    [Arguments]    ${workout_id}
    Navigate To Page    ${WORKOUT_DETAIL_PAGE}${workout_id}
    Wait For Element And Take Screenshot    ${WORKOUT_NAME_DISPLAY}    workout_detail_page

Navigate To Workout History Page
    [Documentation]    Navigates to the workout history page
    Navigate To Page    ${WORKOUT_HISTORY_PAGE}
    Wait For Element And Take Screenshot    ${WORKOUT_LIST_ITEM}    workout_history_page

Fill Workout Form
    [Documentation]    Fills the workout form with provided data
    [Arguments]    ${name}    ${notes}=    ${date}=
    Input Text And Verify    ${WORKOUT_NAME_FIELD}    ${name}
    Run Keyword If    '${notes}' != ''    Input Text And Verify    ${WORKOUT_NOTES_FIELD}    ${notes}
    Run Keyword If    '${date}' != ''     Input Text And Verify    ${WORKOUT_DATE_FIELD}    ${date}
    Take Screenshot With Timestamp    workout_form_filled

Start New Workout
    [Documentation]    Starts a new workout
    [Arguments]    ${name}    ${notes}=
    Navigate To New Workout Page
    Fill Workout Form    ${name}    ${notes}
    Click And Wait    ${START_WORKOUT_BUTTON}
    Take Screenshot With Timestamp    workout_started

Start Workout From Routine
    [Documentation]    Starts a workout from a routine
    [Arguments]    ${routine_id}
    Navigate To Page    /routines/${routine_id}
    Click And Wait    ${START_WORKOUT_BUTTON}
    Take Screenshot With Timestamp    workout_started_from_routine

Pause Workout
    [Documentation]    Pauses the current workout
    Click And Wait    ${PAUSE_WORKOUT_BUTTON}
    Take Screenshot With Timestamp    workout_paused

Resume Workout
    [Documentation]    Resumes the paused workout
    Click And Wait    ${RESUME_WORKOUT_BUTTON}
    Take Screenshot With Timestamp    workout_resumed

Finish Workout
    [Documentation]    Finishes the current workout
    Click And Wait    ${FINISH_WORKOUT_BUTTON}
    Take Screenshot With Timestamp    workout_finished

Add Exercise To Workout
    [Documentation]    Adds an exercise to the current workout
    [Arguments]    ${exercise_name}
    Click And Wait    ${ADD_EXERCISE_TO_WORKOUT_BUTTON}
    
    # Wait for modal to appear
    Wait Until Element Is Visible    ${EXERCISE_SEARCH_MODAL}
    
    # Search for exercise
    Input Text    ${EXERCISE_SEARCH_FIELD}    ${exercise_name}
    Wait For Page To Load
    
    # Select exercise
    Click Element    ${EXERCISE_SELECT_CHECKBOX}
    Click And Wait    //button[contains(text(),'Add Selected')]
    
    Take Screenshot With Timestamp    exercise_added_to_workout

Remove Exercise From Workout
    [Documentation]    Removes an exercise from the current workout
    [Arguments]    ${exercise_name}
    ${exercise_element}=    Get WebElement    //div[contains(text(),'${exercise_name}')]
    Click Element    ${exercise_element}/..//${REMOVE_EXERCISE_FROM_WORKOUT}
    Take Screenshot With Timestamp    exercise_removed_from_workout

Complete Exercise Set
    [Documentation]    Completes a set for an exercise
    [Arguments]    ${reps}    ${weight}    ${notes}=
    Input Text And Verify    ${EXERCISE_REPS_INPUT}    ${reps}
    Input Text And Verify    ${EXERCISE_WEIGHT_INPUT}    ${weight}
    Run Keyword If    '${notes}' != ''    Input Text And Verify    ${EXERCISE_NOTES_INPUT}    ${notes}
    Click And Wait    ${COMPLETE_SET_BUTTON}
    Take Screenshot With Timestamp    set_completed

Skip Exercise Set
    [Documentation]    Skips a set for an exercise
    Click And Wait    ${SKIP_SET_BUTTON}
    Take Screenshot With Timestamp    set_skipped

Add Extra Set
    [Documentation]    Adds an extra set to an exercise
    Click And Wait    ${ADD_SET_BUTTON}
    Take Screenshot With Timestamp    set_added

Start Rest Timer
    [Documentation]    Starts the rest timer
    Click And Wait    ${START_REST_TIMER_BUTTON}
    Take Screenshot With Timestamp    rest_timer_started

Pause Rest Timer
    [Documentation]    Pauses the rest timer
    Click And Wait    ${PAUSE_REST_TIMER_BUTTON}
    Take Screenshot With Timestamp    rest_timer_paused

Skip Rest Timer
    [Documentation]    Skips the rest timer
    Click And Wait    ${SKIP_REST_TIMER_BUTTON}
    Take Screenshot With Timestamp    rest_timer_skipped

Navigate To Next Exercise
    [Documentation]    Navigates to the next exercise in workout
    Click And Wait    ${NEXT_EXERCISE_BUTTON}
    Take Screenshot With Timestamp    next_exercise

Navigate To Previous Exercise
    [Documentation]    Navigates to the previous exercise in workout
    Click And Wait    ${PREVIOUS_EXERCISE_BUTTON}
    Take Screenshot With Timestamp    previous_exercise

Save Workout
    [Documentation]    Saves the current workout
    Click And Wait    ${SAVE_WORKOUT_BUTTON}
    Take Screenshot With Timestamp    workout_saved

Delete Workout
    [Documentation]    Deletes a workout
    [Arguments]    ${workout_id}
    Navigate To Workout Detail Page    ${workout_id}
    Click And Wait    ${DELETE_WORKOUT_BUTTON}
    # Handle confirmation dialog if present
    ${alert_present}=    Run Keyword And Return Status    Alert Should Be Present
    Run Keyword If    ${alert_present}    Accept Alert
    Take Screenshot With Timestamp    workout_deleted

Search Workouts
    [Documentation]    Searches for workouts
    [Arguments]    ${search_term}
    Navigate To Workouts Page
    Input Text And Verify    ${WORKOUT_SEARCH_FIELD}    ${search_term}
    Wait For Page To Load
    Take Screenshot With Timestamp    workout_search_results

Filter Workouts
    [Documentation]    Filters workouts by criteria
    [Arguments]    ${filter_value}
    Navigate To Workouts Page
    Select From List By Label    ${WORKOUT_FILTER_DROPDOWN}    ${filter_value}
    Wait For Page To Load
    Take Screenshot With Timestamp    workout_filter_results

Verify Workout In List
    [Documentation]    Verifies a workout appears in the list
    [Arguments]    ${workout_name}
    Navigate To Workouts Page
    Page Should Contain    ${workout_name}
    Take Screenshot With Timestamp    workout_in_list

Verify Workout Details
    [Documentation]    Verifies workout details on detail page
    [Arguments]    ${workout_id}    ${expected_name}    ${expected_status}
    Navigate To Workout Detail Page    ${workout_id}
    Verify Element Contains Text    ${WORKOUT_NAME_DISPLAY}    ${expected_name}
    Verify Element Contains Text    ${WORKOUT_STATUS_DISPLAY}    ${expected_status}
    Take Screenshot With Timestamp    workout_details_verified

Verify Workout Status
    [Documentation]    Verifies the workout status
    [Arguments]    ${expected_status}
    Verify Element Contains Text    ${WORKOUT_STATUS_DISPLAY}    ${expected_status}
    Take Screenshot With Timestamp    workout_status_verified

Verify Workout Timer Running
    [Documentation]    Verifies the workout timer is running
    Wait Until Element Is Visible    ${WORKOUT_TIMER_DISPLAY}
    Take Screenshot With Timestamp    workout_timer_running

Verify Exercise In Workout
    [Documentation]    Verifies an exercise is in the workout
    [Arguments]    ${workout_id}    ${exercise_name}
    Navigate To Workout Detail Page    ${workout_id}
    Page Should Contain    ${exercise_name}
    Take Screenshot With Timestamp    exercise_in_workout_verified

Count Workouts In List
    [Documentation]    Counts the number of workouts in the list
    Navigate To Workouts Page
    ${count}=    Get Element Count    ${WORKOUT_LIST_ITEM}
    Take Screenshot With Timestamp    workout_count
    [Return]    ${count}

Count Exercises In Workout
    [Documentation]    Counts the number of exercises in a workout
    [Arguments]    ${workout_id}
    Navigate To Workout Detail Page    ${workout_id}
    ${count}=    Get Element Count    //div[contains(@class,'exercise-in-workout')]
    Take Screenshot With Timestamp    workout_exercise_count
    [Return]    ${count}

Test Complete Workout Flow
    [Documentation]    Tests a complete workout flow
    [Arguments]    ${workout_name}    ${exercise_name}    ${sets}=3    ${reps}=10    ${weight}=50
    # Start workout
    Start New Workout    ${workout_name}
    Verify Workout Status    In Progress
    
    # Add exercise
    Add Exercise To Workout    ${exercise_name}
    
    # Complete sets
    FOR    ${set_num}    IN RANGE    1    ${sets}+1
        Complete Exercise Set    ${reps}    ${weight}    Set ${set_num} completed
        Run Keyword If    ${set_num} < ${sets}    Start Rest Timer
        Run Keyword If    ${set_num} < ${sets}    Sleep    2s
        Run Keyword If    ${set_num} < ${sets}    Skip Rest Timer
    END
    
    # Finish workout
    Finish Workout
    Verify Workout Status    Completed
    
    # Save workout
    Save Workout

Get Workout ID From URL
    [Documentation]    Extracts workout ID from current URL
    ${current_url}=    Get Location
    ${workout_id}=    Get Regexp Matches    ${current_url}    /workouts/([0-9]+)    1
    [Return]    ${workout_id}[0]
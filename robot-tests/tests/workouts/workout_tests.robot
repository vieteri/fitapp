*** Settings ***
Documentation    Workout execution and management tests for the fitness application
Resource         ../../resources/common.robot
Resource         ../../keywords/auth_keywords.robot
Resource         ../../keywords/workout_keywords.robot
Resource         ../../keywords/routine_keywords.robot
Resource         ../../keywords/exercise_keywords.robot
Suite Setup      Setup Test Environment
Suite Teardown   Teardown Test Environment
Test Setup       Setup Workout Test
Test Teardown    Teardown Workout Test

*** Variables ***
${WORKOUT_NAME}         Test Workout
${WORKOUT_NOTES}        This is a test workout for automated testing
${ROUTINE_NAME}         Test Routine
${ROUTINE_DESCRIPTION}  Test routine for workout
${EXERCISE_NAME}        Test Exercise
${EXERCISE_DESCRIPTION} Test exercise for workout

*** Test Cases ***
User Can Start New Workout
    [Documentation]    Test that a user can start a new workout
    [Tags]    workout    positive    start    smoke
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Verify Workout Status    In Progress
    Verify Workout Timer Running
    Take Screenshot With Timestamp    workout_started_successfully

User Can Pause and Resume Workout
    [Documentation]    Test that a user can pause and resume a workout
    [Tags]    workout    positive    pause_resume
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Pause Workout
    Verify Workout Status    Paused
    Take Screenshot With Timestamp    workout_paused_successfully
    
    Resume Workout
    Verify Workout Status    In Progress
    Take Screenshot With Timestamp    workout_resumed_successfully

User Can Finish Workout
    [Documentation]    Test that a user can finish a workout
    [Tags]    workout    positive    finish
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Finish Workout
    Verify Workout Status    Completed
    Take Screenshot With Timestamp    workout_finished_successfully

User Can Add Exercise To Workout
    [Documentation]    Test that a user can add an exercise to a workout
    [Tags]    workout    positive    exercises
    # Create exercise first
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    
    # Start workout and add exercise
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    ${EXERCISE_NAME}
    ${workout_id}=    Get Workout ID From URL
    Verify Exercise In Workout    ${workout_id}    ${EXERCISE_NAME}
    Take Screenshot With Timestamp    exercise_added_to_workout

User Can Remove Exercise From Workout
    [Documentation]    Test that a user can remove an exercise from a workout
    [Tags]    workout    positive    exercises
    # Create exercise and start workout
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    
    # Add then remove exercise
    Add Exercise To Workout    ${EXERCISE_NAME}
    Remove Exercise From Workout    ${EXERCISE_NAME}
    Take Screenshot With Timestamp    exercise_removed_from_workout

User Can Complete Exercise Sets
    [Documentation]    Test that a user can complete exercise sets
    [Tags]    workout    positive    sets
    # Create exercise and start workout
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    ${EXERCISE_NAME}
    
    # Complete multiple sets
    Complete Exercise Set    10    50    First set completed
    Complete Exercise Set    8    55    Second set completed
    Complete Exercise Set    6    60    Third set completed
    Take Screenshot With Timestamp    exercise_sets_completed

User Can Skip Exercise Sets
    [Documentation]    Test that a user can skip exercise sets
    [Tags]    workout    positive    sets
    # Create exercise and start workout
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    ${EXERCISE_NAME}
    
    # Skip some sets
    Skip Exercise Set
    Skip Exercise Set
    Take Screenshot With Timestamp    exercise_sets_skipped

User Can Add Extra Sets
    [Documentation]    Test that a user can add extra sets to an exercise
    [Tags]    workout    positive    sets
    # Create exercise and start workout
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    ${EXERCISE_NAME}
    
    # Add extra sets
    Add Extra Set
    Add Extra Set
    Take Screenshot With Timestamp    extra_sets_added

User Can Use Rest Timer
    [Documentation]    Test that a user can use the rest timer
    [Tags]    workout    positive    rest_timer
    # Create exercise and start workout
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    ${EXERCISE_NAME}
    
    # Complete set and use rest timer
    Complete Exercise Set    10    50    Set completed
    Start Rest Timer
    Take Screenshot With Timestamp    rest_timer_started
    
    Sleep    3s
    Skip Rest Timer
    Take Screenshot With Timestamp    rest_timer_skipped

User Can Navigate Between Exercises
    [Documentation]    Test that a user can navigate between exercises in a workout
    [Tags]    workout    positive    navigation
    # Create multiple exercises
    Create New Exercise    First Exercise    First exercise description
    Create New Exercise    Second Exercise    Second exercise description
    
    # Start workout and add exercises
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    First Exercise
    Add Exercise To Workout    Second Exercise
    
    # Navigate between exercises
    Navigate To Next Exercise
    Take Screenshot With Timestamp    navigated_to_next_exercise
    
    Navigate To Previous Exercise
    Take Screenshot With Timestamp    navigated_to_previous_exercise

User Can Start Workout From Routine
    [Documentation]    Test that a user can start a workout from a routine
    [Tags]    workout    positive    routine
    # Create exercise and routine
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Create New Routine    ${ROUTINE_NAME}    ${ROUTINE_DESCRIPTION}
    ${routine_id}=    Get Routine ID From URL
    Add Exercise To Routine    ${routine_id}    ${EXERCISE_NAME}
    
    # Start workout from routine
    Start Workout From Routine    ${routine_id}
    Verify Workout Status    In Progress
    Take Screenshot With Timestamp    workout_started_from_routine

User Can Save Workout
    [Documentation]    Test that a user can save a workout
    [Tags]    workout    positive    save
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Save Workout
    Take Screenshot With Timestamp    workout_saved_successfully

User Can Delete Workout
    [Documentation]    Test that a user can delete a workout
    [Tags]    workout    positive    delete
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Finish Workout
    ${workout_id}=    Get Workout ID From URL
    Delete Workout    ${workout_id}
    Take Screenshot With Timestamp    workout_deleted_successfully

User Can View Workout History
    [Documentation]    Test that a user can view workout history
    [Tags]    workout    positive    history
    # Create and complete a workout
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Finish Workout
    
    # View workout history
    Navigate To Workout History Page
    Page Should Contain    ${WORKOUT_NAME}
    Take Screenshot With Timestamp    workout_history_viewed

User Can Search Workouts
    [Documentation]    Test that a user can search for workouts
    [Tags]    workout    positive    search
    # Create multiple workouts
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Finish Workout
    Start New Workout    Another Workout    Another workout notes
    Finish Workout
    
    # Search for specific workout
    Search Workouts    ${WORKOUT_NAME}
    Page Should Contain    ${WORKOUT_NAME}
    Page Should Not Contain    Another Workout
    Take Screenshot With Timestamp    workout_search_results

User Can Filter Workouts
    [Documentation]    Test that a user can filter workouts
    [Tags]    workout    positive    filter
    # Create workouts with different statuses
    Start New Workout    Completed Workout    Completed workout notes
    Finish Workout
    Start New Workout    In Progress Workout    In progress workout notes
    
    # Filter by status
    Filter Workouts    Completed
    Page Should Contain    Completed Workout
    Page Should Not Contain    In Progress Workout
    Take Screenshot With Timestamp    workout_filter_results

Workout Timer Functions Correctly
    [Documentation]    Test that workout timer functions correctly
    [Tags]    workout    positive    timer
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Verify Workout Timer Running
    
    # Pause and check timer
    Pause Workout
    Sleep    2s
    Resume Workout
    Verify Workout Timer Running
    Take Screenshot With Timestamp    workout_timer_functioning

Workout Statistics Are Displayed
    [Documentation]    Test that workout statistics are displayed correctly
    [Tags]    workout    positive    statistics
    # Create exercise and start workout
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    ${EXERCISE_NAME}
    
    # Complete some sets
    Complete Exercise Set    10    50    Set 1
    Complete Exercise Set    8    55    Set 2
    
    # Check statistics
    Page Should Contain    Total Sets: 2
    Page Should Contain    Total Reps: 18
    Take Screenshot With Timestamp    workout_statistics_displayed

Workout Notes Can Be Added
    [Documentation]    Test that notes can be added to workouts and exercises
    [Tags]    workout    positive    notes
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    ${EXERCISE_NAME}
    
    # Add notes to exercise sets
    Complete Exercise Set    10    50    This set felt good
    
    # Verify notes are saved
    Page Should Contain    This set felt good
    Take Screenshot With Timestamp    workout_notes_added

Complete Workout Flow Test
    [Documentation]    Test complete workout flow from start to finish
    [Tags]    workout    positive    integration    smoke
    Test Complete Workout Flow    ${WORKOUT_NAME}    ${EXERCISE_NAME}    3    10    50
    Take Screenshot With Timestamp    complete_workout_flow

Workout Auto-Save Functions
    [Documentation]    Test that workout auto-save functions correctly
    [Tags]    workout    positive    autosave
    Create New Exercise    ${EXERCISE_NAME}    ${EXERCISE_DESCRIPTION}
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Add Exercise To Workout    ${EXERCISE_NAME}
    Complete Exercise Set    10    50    Auto-save test
    
    # Simulate page refresh
    Reload Page
    Wait For Page To Load
    
    # Check if data is preserved
    Page Should Contain    Auto-save test
    Take Screenshot With Timestamp    workout_autosave_functioning

Workout Sharing Functions
    [Documentation]    Test that workout sharing functions work (if available)
    [Tags]    workout    positive    sharing
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Finish Workout
    
    ${share_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Share')]
    Run Keyword If    ${share_button_present}    Click Element    //button[contains(text(),'Share')]
    Run Keyword If    ${share_button_present}    Take Screenshot With Timestamp    workout_share_clicked

Workout Export Functions
    [Documentation]    Test that workout export functions work (if available)
    [Tags]    workout    positive    export
    Start New Workout    ${WORKOUT_NAME}    ${WORKOUT_NOTES}
    Finish Workout
    
    ${export_button_present}=    Run Keyword And Return Status    Page Should Contain Element    //button[contains(text(),'Export')]
    Run Keyword If    ${export_button_present}    Click Element    //button[contains(text(),'Export')]
    Run Keyword If    ${export_button_present}    Take Screenshot With Timestamp    workout_export_clicked

*** Keywords ***
Setup Workout Test
    [Documentation]    Sets up each workout test
    Open Browser To Application
    Test Valid Sign In    ${TEST_EMAIL}    ${TEST_PASSWORD}

Teardown Workout Test
    [Documentation]    Tears down each workout test
    Close Browser Session
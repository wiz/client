import * as Constants from '../../../constants/teams'
import * as Types from '../../../constants/types/teams'
import {RetentionPolicy} from '../../../constants/types/retention-policy'
import * as TeamsGen from '../../../actions/teams-gen'
import * as Container from '../../../util/container'
import {Settings} from '.'
import {anyWaiting} from '../../../constants/waiting'
import * as RouteTreeGen from '../../../actions/route-tree-gen'

export type OwnProps = {
  teamID: Types.TeamID
}

export default Container.connect(
  (state, {teamID}: OwnProps) => {
    const teamDetails = Constants.getTeamDetails(state, teamID)
    const {teamname} = teamDetails
    const publicitySettings = Constants.getTeamPublicitySettings(state, teamID)
    const publicityAnyMember = publicitySettings.anyMemberShowcase
    const publicityMember = publicitySettings.member
    const publicityTeam = publicitySettings.team
    const settings = teamDetails.settings || Constants.initialTeamSettings
    const openTeamRole: Types.MaybeTeamRoleType = Constants.teamRoleByEnum[settings.joinAs] || 'none'
    return {
      canShowcase: teamDetails.allowPromote || teamDetails.role === 'admin' || teamDetails.role === 'owner',
      error: state.teams.errorInSettings,
      ignoreAccessRequests: publicitySettings.ignoreAccessRequests,
      isBigTeam: Constants.isBigTeam(state, teamname),
      openTeam: settings.open,
      // Cast to TeamRoleType
      openTeamRole: openTeamRole === 'none' ? 'reader' : openTeamRole,
      publicityAnyMember,
      publicityMember,
      publicityTeam,
      teamID,
      waitingForSavePublicity: anyWaiting(
        state,
        Constants.teamWaitingKeyByID(teamID, state),
        Constants.retentionWaitingKey(teamID),
        Constants.settingsWaitingKey(teamID)
      ),
      yourOperations: Constants.getCanPerformByID(state, teamID),
    }
  },
  (dispatch, {teamID}: OwnProps) => ({
    _showRetentionWarning: (
      policy: RetentionPolicy,
      onConfirm: () => void,
      entityType: 'big team' | 'small team'
    ) =>
      dispatch(
        RouteTreeGen.createNavigateAppend({
          path: [{props: {entityType, onConfirm, policy}, selected: 'retentionWarning'}],
        })
      ),
    clearError: () => dispatch(TeamsGen.createSettingsError({error: ''})),
    savePublicity: (settings: Types.PublicitySettings) =>
      dispatch(TeamsGen.createSetPublicity({settings, teamID})),
    saveRetentionPolicy: (policy: RetentionPolicy) =>
      dispatch(TeamsGen.createSaveTeamRetentionPolicy({policy, teamID})),
  }),
  (stateProps, dispatchProps) => {
    return {
      ...stateProps,
      savePublicity: (
        settings: Types.PublicitySettings,
        showRetentionWarning: boolean,
        policy: RetentionPolicy | null
      ) => {
        if (policy && stateProps.yourOperations.setRetentionPolicy) {
          showRetentionWarning &&
            dispatchProps._showRetentionWarning(
              policy,
              () => dispatchProps.saveRetentionPolicy(policy),
              stateProps.isBigTeam ? 'big team' : 'small team'
            )
          !showRetentionWarning && dispatchProps.saveRetentionPolicy(policy)
        }
        dispatchProps.savePublicity(settings)
        dispatchProps.clearError()
      },
    }
  }
)(Settings)

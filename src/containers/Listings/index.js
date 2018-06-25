import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { createStructuredSelector } from 'reselect'
import styled from 'styled-components'
import AppBar from 'material-ui/AppBar'
import { withStyles } from 'material-ui/styles'
import Tabs, { Tab } from 'material-ui/Tabs'
import { TablePagination, TableRow } from 'material-ui/Table'
import Paper from 'material-ui/Paper'

import ListingCard from './ListingCard'
import { colors } from '../../global-styles'

import {
  selectAllListings,
  selectFaceoffs,
  selectWhitelist,
  selectCandidates,
  onlyCandidateIDs,
  onlyFaceoffIDs,
  onlyWhitelistIDs,
} from 'modules/listings/selectors'
import {
  selectStats,
  selectVoting,
  selectAccount,
  selectRegistry,
} from 'modules/home/selectors'
import * as actions from 'modules/listings/actions'

import Transactions from 'containers/Transactions/Loadable'
import TablePaginationActionsWrapped from './Pagination'

const ListingsWrapper = styled.div`
  width: 80vw;
  margin: 20px auto 0;
`
const FlexContainer = styled.div`
  display: flex;
  margin: 30px auto 0;
`

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.contentBackground,
    boxShadow: '0 0 0 0',
  },
  tableWrapper: {
    // overflowX: 'auto',
    padding: '0',
  },
  appBar: {
    boxShadow: '0 0 0 0',
    borderBottom: `.5px solid ${colors.paleGrey}`,
  },
  tab: {
    '& > span': {
      '& > span': {
        paddingLeft: '5px',
      },
    },
    fontWeight: 'bold',
  },
  caption: {
    display: 'none',
  },
})

class SimpleTabs extends Component {
  state = {
    value: 0,
    page: 0,
    rowsPerPage: 5,
  }

  handleChange = (event, value) => {
    this.setState({ value })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value })
  }

  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    const data =
      order === 'desc'
        ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1))

    this.setState({ data, order, orderBy })
  }

  openSidePanel = (one, openThis) => {
    this.props.onOpenSidePanel(one, openThis)
  }
  render() {
    const {
      candidates,
      faceoffs,
      whitelist,
      stats,
      candidateIDs,
      faceoffIDs,
      whitelistIDs,
      chooseTCR,
      classes,
      voting,
      account,
      registry,
    } = this.props
    const { rowsPerPage, page, value } = this.state

    let data
    if (value === 0) {
      data = whitelistIDs
    } else if (value === 1) {
      data = candidateIDs
    } else if (value === 2) {
      data = faceoffIDs
    }
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage)

    return (
      <Transactions>
        <ListingsWrapper>
          <Paper className={classes.root}>
            <AppBar className={classes.appBar} position="static" color="inherit">
              <Tabs
                centered={false}
                value={value}
                onChange={this.handleChange}
                indicatorColor="primary"
              >
                <Tab
                  className={classes.tab}
                  label={`registry (${stats.sizes.whitelist})`}
                />
                <Tab
                  className={classes.tab}
                  label={`applications (${stats.sizes.candidates})`}
                />
                <Tab className={classes.tab} label={`voting (${stats.sizes.faceoffs})`} />
              </Tabs>
            </AppBar>
            <div className={classes.tableWrapper}>
              <FlexContainer>
                {value === 0 &&
                  data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(id => {
                      return (
                        <ListingCard
                          key={id}
                          one={whitelist.get(id)}
                          listingType={'whitelist'}
                          openSidePanel={this.openSidePanel}
                          chooseTCR={chooseTCR}
                          tokenData={whitelist.getIn([id, 'tokenData'])}
                          voting={voting}
                          account={account}
                          registry={registry}
                          value={value}
                        />
                      )
                    })}
                {value === 1 &&
                  data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(id => {
                      return (
                        <ListingCard
                          key={id}
                          one={candidates.get(id)}
                          listingType={'candidates'}
                          openSidePanel={this.openSidePanel}
                          updateTrigger={candidates.getIn([id, 'appExpiry', 'expired'])}
                          tokenData={candidates.getIn([id, 'tokenData'])}
                          value={value}
                        />
                      )
                    })}
                {value === 2 &&
                  data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(id => {
                      return (
                        <ListingCard
                          key={id}
                          one={faceoffs.get(id)}
                          listingType={'faceoffs'}
                          openSidePanel={this.openSidePanel}
                          updateTrigger={faceoffs.getIn([id, 'revealExpiry', 'expired'])}
                          revealTrigger={faceoffs.getIn([id, 'commitExpiry', 'expired'])}
                          tokenData={faceoffs.getIn([id, 'tokenData'])}
                          voting={voting}
                          account={account}
                          registry={registry}
                          value={value}
                        />
                      )
                    })}
              </FlexContainer>
              {emptyRows === 5 && (
                <TableRow component="div" style={{ height: 80 * emptyRows }}>
                  <div />
                </TableRow>
              )}

              <TablePagination
                component="span"
                colSpan={3}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={this.handleChangePage}
                Actions={TablePaginationActionsWrapped}
                classes={{
                  toolbar: classes.toolbar,
                  caption: classes.caption,
                }}
              />
            </div>
          </Paper>
        </ListingsWrapper>
      </Transactions>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onOpenSidePanel: (selectedOne, openThis) =>
      dispatch(actions.openSidePanel(selectedOne, openThis)),
  }
}

const mapStateToProps = createStructuredSelector({
  allListings: selectAllListings,
  candidates: selectCandidates,
  candidateIDs: onlyCandidateIDs,
  faceoffs: selectFaceoffs,
  faceoffIDs: onlyFaceoffIDs,
  whitelist: selectWhitelist,
  whitelistIDs: onlyWhitelistIDs,
  stats: selectStats,
  voting: selectVoting,
  account: selectAccount,
  registry: selectRegistry,
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default compose(withStyles(styles)(withConnect(SimpleTabs)))
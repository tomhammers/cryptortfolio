import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Dropdown, Grid, Message } from 'semantic-ui-react';

import AddCoin from '../containers/AddCoin';
import CoinCard from '../components/CoinCard';
import CoinTable from '../components/CoinTable';
import EditCoinQuantityModal from '../components/EditCoinQuantityModal';

import { getCoinList } from '../actions/coinListActions';
import {
  getPortfolioCoinPrices,
  removeCoinFromPortfolio,
  updatePortfolioCoinDetails,
  updatePortfolioCoinQuantity,
  updateSortByOption,
} from '../actions/portfolioActions';
import { toggleShowModal } from '../actions/showImportEthereumAddressActions';

import { calculatePortfolioBreakdown, sort_by } from '../common/utils';
import { coinViewOptions, sortByOptions } from '../common/constants';

class Main extends Component {
  state = {
    editCoinQuantityModalOpen: false,
    loadingCoinList: false,
    portfolioBreakdown: [],
    selectedCoinId: '',
    selectedCoinQuantity: 0,
    showAddCoinForm: false,
    sortByOption: this.props.portfolio.sortBy,
  };

  componentDidMount() {
    this.interval = setInterval(() => {
      this.props.getPortfolioCoinPrices(this.props.portfolio);
    }, 15000);
  }

  async componentWillMount() {
    this.props.getPortfolioCoinPrices(this.props.portfolio);
    // no need to get new coinList on every page load
    if (this.props.coinList === null) {
      await this.props.getCoinList();
    }
    await this.props.updatePortfolioCoinDetails(
      this.props.portfolio,
      this.props.coinList,
    );
  }

  componentWillUpdate(nextProps) {
    if (nextProps.portfolio.coins !== this.props.portfolio.coins) {
      let portfolioBreakdown = calculatePortfolioBreakdown(nextProps.portfolio);
      portfolioBreakdown.sort(sort_by(this.state.sortByOption));
      this.setState({ portfolioBreakdown: portfolioBreakdown });
    }
  }

  onAddCoinClick = async () => {
    this.setState({
      loadingCoinList: true,
    });
    await this.props.getCoinList();
    this.setState({
      loadingCoinList: false,
      showAddCoinForm: true,
    });
    this.el.scrollIntoView({ behavior: 'smooth' });
  };

  onDeleteClick = coinId => {
    this.props.removeCoinFromPortfolio(coinId);
  };

  onEditClick = async coinId => {
    const selectedCoinQuantity = await this.props.portfolio.coins[coinId]
      .quantity;
    this.setState({
      selectedCoinId: coinId,
      selectedCoinQuantity: selectedCoinQuantity,
      editCoinQuantityModalOpen: true,
    });
  };

  onEditCoinQuantitySubmit = newCoinQuantity => {
    this.props.updatePortfolioCoinQuantity(
      this.state.selectedCoinId,
      newCoinQuantity,
    );
    this.setState({ editCoinQuantityModalOpen: false });
  };

  updateSortByOption = async value => {
    this.setState({ sortByOption: value });
    let portfolioBreakdown = await calculatePortfolioBreakdown(
      this.props.portfolio,
    );
    portfolioBreakdown.sort(sort_by(this.state.sortByOption));
    this.props.updateSortByOption(this.state.sortByOption);

    this.setState({ portfolioBreakdown: portfolioBreakdown });
  };

  renderCards() {
    const coinsInPortfolio = this.props.portfolio.coins;
    return this.state.portfolioBreakdown.map((coin, i) => {
      if (coinsInPortfolio[coin.key] !== undefined) {
        return (
          <CoinCard
            color={this.props.accentColour}
            balancesShown={this.props.balancesShown}
            key={coin.key}
            id={coin.key}
            portfolio={this.props.portfolio}
            coinBreakdown={this.state.portfolioBreakdown[i]}
            onDeleteClick={this.onDeleteClick}
            onEditClick={this.onEditClick}
          />
        );
      }
      return null;
    });
  }

  render() {
    const columns = this.props.coinView === coinViewOptions.coinCards ? 2 : 1;

    return (
      <div>
        <Grid columns={columns} stackable>
          <Grid.Row style={{ paddingBottom: '0px', paddingTop: '25px' }}>
            <Grid.Column>
              {'Sort by '}
              <Dropdown
                floating
                inline
                onChange={(event, { value }) => this.updateSortByOption(value)}
                options={sortByOptions}
                value={this.state.sortByOption}
              />
            </Grid.Column>
          </Grid.Row>
          {this.props.coinView === coinViewOptions.coinCards ? (
            <Grid.Row>{this.renderCards()}</Grid.Row>
          ) : null}
          {this.props.coinView === coinViewOptions.coinTable ? (
            <Grid.Row>
              <CoinTable
                balancesShown={this.props.balancesShown}
                coinsInPortfolio={this.props.portfolio.coins}
                fiatCurrency={this.props.portfolio.fiatCurrency}
                onDeleteClick={this.onDeleteClick}
                onEditClick={this.onEditClick}
                portfolioBreakdown={this.state.portfolioBreakdown}
              />
            </Grid.Row>
          ) : null}
          <Grid.Row>
            <Grid.Column width={16}>
              {!this.state.showAddCoinForm ? (
                <Button
                  primary
                  loading={this.state.loadingCoinList}
                  onClick={this.onAddCoinClick}
                  size="large"
                >
                  Add Coin
                </Button>
              ) : null}

              {this.state.showAddCoinForm ? (
                <div ref={el => { this.el = el; }}>
                  <Message>
                    <Message.Content>
                      Search for an individual coin
                    </Message.Content>
                  </Message>
                  <AddCoin
                    onCoinSubmit={() => {
                      this.setState({ showAddCoinForm: false });
                    }}
                  />
                  <Message style={{ marginTop: '20px' }}>
                    <Message.Content>
                      <p>
                        Or enter an Ethereum Address to automatically import
                        Ethereum and ERC20 token balances to your portfolio
                      </p>
                    </Message.Content>
                  </Message>
                  <Button
                    onClick={() =>
                      this.props.toggleShowEtheremAddressModal(true)
                    }
                    primary
                  >
                    Add Ethereum Address
                  </Button>
                </div>
              ) : null}
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <EditCoinQuantityModal
          close={() => this.setState({ editCoinQuantityModalOpen: false })}
          coinId={this.state.selectedCoinId}
          coinQuantity={this.state.selectedCoinQuantity}
          onEditCoinQuantitySubmit={this.onEditCoinQuantitySubmit}
          open={this.state.editCoinQuantityModalOpen}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    accentColour: state.accentColour,
    balancesShown: state.balancesShown,
    coinList: state.coinList,
    coinView: state.coinView,
    portfolio: state.portfolio,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getCoinList,
      getPortfolioCoinPrices,
      removeCoinFromPortfolio,
      toggleShowEtheremAddressModal: toggleShowModal,
      updatePortfolioCoinDetails,
      updatePortfolioCoinQuantity,
      updateSortByOption,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);

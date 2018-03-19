import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Grid, Header, Segment, Image } from 'semantic-ui-react';
import currencyFormatter from 'currency-formatter';

const CoinCard = props => {
  const { balancesShown, coinBreakdown, id, portfolio, onDeleteClick, onEditClick } = props;
  const { coins, fiatCurrency } = portfolio;
  const coinPercentageColor =
    coins[id].price[fiatCurrency.key].CHANGEPCT24HOUR < 0 ? 'red' : 'green';

  const renderCurrency = (amount, fiatCurrency) => {
    const precision = parseFloat(amount) < 0.1 ? 4 : 2;
    return currencyFormatter.format(amount, { code: fiatCurrency, precision });
  };

  return (
    <Grid.Column>
      <Segment
        color="yellow"
        padded
        raised
        style={{ marginTop: '5px', marginBottom: '5px' }}
      >
        <Grid>
          <Grid.Row>
            <Grid.Column width={13}>
              <Header as="h4" floated="left">
                <Image
                  src={`https://www.cryptocompare.com${
                    coins[id].coinDetails.ImageUrl
                  }`}
                  verticalAlign="middle"
                />
                <Header.Content>
                  {coins[id].coinDetails.CoinName}
                  <Header.Subheader>
                    {renderCurrency(
                      coins[id].price[fiatCurrency.key].PRICE,
                      fiatCurrency.key,
                    )}
                  </Header.Subheader>
                  <Header.Subheader>
                    <span style={{ color: coinPercentageColor }}>
                      {Math.round(
                        coins[id].price[fiatCurrency.key].CHANGEPCT24HOUR * 100,
                      ) / 100}%
                    </span>
                    {' (24h)'}
                    <a href="/api/hello">Click Me</a>
                  </Header.Subheader>
                </Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={3} floated="right" textAlign="right">
              <Dropdown direction="left" floating item icon="setting">
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => onEditClick(id)}>
                    Edit Quantity
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => onDeleteClick(id)}>
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column style={{ paddingLeft: '34px' }}>
              <Header as="h6">
                <Header.Content>
                  Holdings
                  {balancesShown ? (
                    <span>
                      <Header.Subheader>
                        {coins[id].quantity} {coins[id].coinDetails.Name}
                      </Header.Subheader>
                      <Header.Subheader>
                        {renderCurrency(
                          coins[id].quantity *
                            coins[id].price[fiatCurrency.key].PRICE,
                          fiatCurrency.key,
                        )}
                      </Header.Subheader>
                    </span>
                  ) : null}
                  <br />
                    {coinBreakdown.percOfPortfolio}% of portfolio
                </Header.Content>
              </Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Grid.Column>
  );
};

CoinCard.propTypes = {
  balancesShown: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  portfolio: PropTypes.object.isRequired,
  coinBreakdown: PropTypes.object.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
};

export default CoinCard;
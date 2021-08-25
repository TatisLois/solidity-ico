https://github.com/TatisLois/solidity-ico

The following is a micro audit of git commit ebecfdd57cd2a2c856ad9e8293af6b3975bea687

## General comments

What's the purpose of minting coins between phases?

I didn't find code for a transfer tax or a treasury account.


## issue-1

**[High]** isAbleToPurchase() mixes unit types

In TomatoICO.sol:65 and :73, the require checks a mixed TMTO+ETH balance against an ETH value.


## issue-2

**[High]** purchase() mixes unit types

In TomatoICO.sol:156, an ETH value is added to a TMTO value.


## issue-3

**[Code Quality]** purchase() should not accept an `amount` parameter

In TomatoICO.sol:144, the `amount` parameter is redundant. Consider only reading from `msg.value` instead.


## issue-4

**[Code Quality]** NextPhase redundant field

In TomatoICO.sol:39, the `previous` field is redundant; one can read from the contract what order phases are specified, or listen for all NextPhase events and take note of the order.


## issue-5

**[Code Quality]** Purchase redundant field

In TomatoICO.sol:33, the `from` field will always be the address of the contract. Since events are scoped by contract, this field is redundant.


## issue-6

**[Code Quality]** myBalance() is not general

In TomatoICO.sol:118, consider expanding myBalance() to work on an address parameter to make it more flexible.


## Nitpicks

- 70000 ether seems arbitrary, write a comment on how you calculated it.
- Consider removing `toTokens` to save on contract size.
- There's quite a few conversions between ETH and TMTO. Consider keeping units in ETH and only converting at the last moment, to reduce the surface area for potential bugs.
- Consider combining includeSeedInvestor and revokeSeedInvestor into one function to save on deploy cost.
- Consider moving the logic from `isRedeemable` to `redeem` since it is only used in that function.

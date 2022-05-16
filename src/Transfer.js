import React, { useState, useEffect } from 'react'
import { Form, Input, Grid,
  Dropdown } from 'semantic-ui-react'
import config from './config'

function Main(props) {
  const [accountBalance, setAccountBalance] = useState(0)
  const [assets, setAssets] = useState([])

  const {
    setCurrentAccount,
    state: { keyring, currentAccount, api, socket },
  } = props.state

  const setSenderAccount = props.setSenderAccount

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map(account => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: 'user',
  }))

  const initialAddress =
      keyringOptions.length > 0 ? keyringOptions[0].value : ''
  const acctAddr = acct => (acct ? acct.address : '')

  // Set the initial address
  useEffect(async () => {
    // `setCurrentAccount()` is called only when currentAccount is null (uninitialized)
    !currentAccount &&
    initialAddress.length > 0 &&
    setCurrentAccount(keyring.getPair(initialAddress))

    !currentAccount &&
    initialAddress.length > 0 &&
    setSenderAccount(keyring.getPair(initialAddress))

    let unsubscribe
    currentAccount &&
    api.query.system
        .account(acctAddr(currentAccount), balance =>
            setAccountBalance(balance.data.free.toHuman())
        )
        .then(unsub => (unsubscribe = unsub))
        .catch(console.error)

    const _assets = [...config.assets]
    _assets.map(async (item,index)=>{
      const acc = await api.query.octopusAssets.account(item.id, acctAddr(currentAccount))
      _assets[index].amount = acc.balance.toString()
    })
    setAssets(_assets)
    console.log("assets", assets)
    return () => unsubscribe && unsubscribe()
  }, [currentAccount, setCurrentAccount, keyring, initialAddress])
  console.log("_assets", assets)

  const [formState, setFormState] = useState({ addressFrom: ''})
  const { addressFrom } = formState

  const [accSelected, setAccSelected] = useState(initialAddress)
  useEffect(() => {
    setCurrentAccount(keyring.getPair(accSelected))
    setSenderAccount(keyring.getPair(accSelected))
  }, [socket])

  const onChange = (_, data) => {
    setCurrentAccount(keyring.getPair(data.value))
    setSenderAccount(keyring.getPair(data.value))
    setFormState(prev => ({ ...prev, [data.state]: data.value }))
    setAccSelected(data.value)
  }


  const accounts = keyring.getPairs()

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
  })

  const [amount, setAmount] = useState(0)
  const onChangeAmount = (_, data) => {
    setAmount(data.value)
    props.onTransAmountChange(data.value)
  }

  const [tokenName, setTokenName] = useState('atom')
  const onChangeTokenName = (_, data) => {console.log('data', data)
    setTokenName(data.value)
    props.onTransTokenChange(data.value)
  }

  return (
    <Grid.Column width={8}>
      <h1>Sender</h1>
      <Form>
        <Form.Field>
          {assets.map((item,index)=>{console.log("in html", item.amount)
              /*return <Input
                  fluid
                  label={item.name}
                  type="text"
                  key={index}
                  value={item.amount}
              />*/
              return <span key={index}>{item.amount}</span>
            })
          }
        </Form.Field>

        <Form.Field>
          <Dropdown
            placeholder="Select from available addresses"
            fluid
            selection
            search
            options={availableAccounts}
            state="addressFrom"
            onChange={onChange}
            value={accSelected}
          />
        </Form.Field>

        <Form.Field>
          <Input
            fluid
            label="Address"
            type="text"
            placeholder="address"
            value={addressFrom}
            state="addressFrom"
          />
        </Form.Field>
        <Form.Field>
          <Input
              fluid
              label="Native Asset Balance"
              type="text"
              placeholder="balance"
              value={accountBalance}
              state="accountBalance"
          />
        </Form.Field>

        <Form.Field>
          <Input
              fluid
              label="Token to Send"
              type="text"
              state="tokenName"
              value={tokenName}
              onChange={onChangeTokenName}
          />
        </Form.Field>

        <Form.Field>
          <Input
              fluid
              label="Amount"
              type="text"
              state="amount"
              value={amount}
              onChange={onChangeAmount}
          />
        </Form.Field>

      </Form>
    </Grid.Column>
  )
}

export default function Transfer(props) {
  const api = props.state.state.api
  return api && api.query && api.query.system && api.query.system.events ? (
      <Main {...props} />
  ) : null
}

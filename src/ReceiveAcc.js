import React, { useState, useEffect } from 'react'
import { Form, Input, Grid, Dropdown } from 'semantic-ui-react'
import { useSubstrateState } from './substrate-lib'
import config from './config'

export default function Main(props) {
  const [currentAccount, setCurrentAccount] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const [assets, setAssets] = useState([...config.assets])
  const api = props.state.state.api
  const socket = props.state.state.socket
  const setSenderAccount = props.state.setCurrentAccount

  const [formState, setFormState] = useState({ addressTo: '' })

  const acctAddr = acct => (acct ? acct.address : '')
  useEffect(() => {
    let unsubscribe
    currentAccount &&
    api.query.system
      .account(acctAddr(currentAccount), balance =>
          setAccountBalance(balance.data.free.toHuman())
      )
      .then(unsub => (unsubscribe = unsub))
      .catch(console.error)

      currentAccount &&
      setSenderAccount(keyring.getPair(currentAccount.address))

      updateAssets()

      const id = setInterval(updateAssets, 3000)
    return () => {
          clearInterval(id)
        unsubscribe && unsubscribe()
      }
  }, [currentAccount, socket])

  const onChange = (_, data) => {
      setCurrentAccount(keyring.getPair(data.value))
      setSenderAccount(keyring.getPair(data.value))
      setFormState(prev => ({ ...prev, [data.state]: data.value }))
      props.onAddressToChange(data.value)
      props.setReceiverAccount(data.value)
  }

    const updateAssets = () => {
        currentAccount &&
        Promise.all(assets.map(async (item, index)=>{
            const acc = await api.query.octopusAssets.account(item.id, acctAddr(currentAccount))
            return {...item, amount: acc.balance.toString()}
        })).then((_assets) => setAssets(_assets))
    }

  const { addressTo } = formState

  const { keyring } = useSubstrateState()
  const accounts = keyring.getPairs()

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
  })

  return (
      <Grid.Column width={8}>
        <h1>Receiver</h1>
        <Form>
          <Form.Field>
              {assets.map((item,index)=>{
                  if(item.name === 'wATOM')
                      return <Input
                          fluid
                          label={item.name}
                          type="text"
                          key={index}
                          value={item.amount}
                      />
              })}
          </Form.Field>
          <Form.Field>
            <Dropdown
                placeholder="Select from available addresses"
                fluid
                selection
                search
                options={availableAccounts}
                state="addressTo"
                onChange={onChange}
            />
          </Form.Field>

          <Form.Field>
            <Input
                fluid
                label="Address"
                type="text"
                placeholder="address"
                value={addressTo}
                state="addressTo"
            />
          </Form.Field>
            <Form.Field>
                <Input
                    fluid
                    label="Native Asset(OCT) Balance"
                    type="text"
                    placeholder="balance"
                    value={accountBalance}
                    state="accountBalance"
                />
            </Form.Field>

        </Form>
      </Grid.Column>
  )
}

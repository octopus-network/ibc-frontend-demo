import React, { useState, useEffect } from 'react'
import { Form, Input, Grid, Label, Icon, Dropdown } from 'semantic-ui-react'
import { TxButton } from './substrate-lib/components'
import { useSubstrateState } from './substrate-lib'

export default function Main(props) { console.log('default function ReceiveAcc(props)')
  const [currentAccount, setCurrentAccount] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const [amount, setAmount] = useState(0)
  const api = props.api

  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ addressTo: '' })

  const acctAddr = acct => (acct ? acct.address : '')
  useEffect(() => {
  currentAccount &&
  api.query.system
      .account(acctAddr(currentAccount), balance =>
          setAccountBalance(balance.data.free.toHuman())
      )
      // .then(unsub => (unsubscribe = unsub))
      .catch(console.error)
  }, [currentAccount, setCurrentAccount])

  const onChange = (_, data) => {
      setCurrentAccount(keyring.getPair(data.value))
      setFormState(prev => ({ ...prev, [data.state]: data.value }))
  }

  const onChangeAmount = (_, data) => {
    setAmount(data.value)
  }

  const { addressTo} = formState

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

  const toHexStr = (myString) => '0x' + new Buffer(myString).toString('hex')

  let tokenSymbol = 0x1234; // Todo: fake symbol for testing

  return (
      <Grid.Column width={8}>
        <h1>Receiver</h1>
        <Form>
          <Form.Field>
            <Label basic color="teal">
              <Icon name="hand point right" />1 Unit = 1000000000000&nbsp;
            </Label>
            <Label
                basic
                color="teal"
                style={{ marginLeft: 0, marginTop: '.5em' }}
            >
              <Icon name="hand point right" />
              Transfer more than the existential amount for account with 0 balance
            </Label>
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
                label="To"
                type="text"
                placeholder="address"
                value={addressTo}
                state="addressTo"
                onChange={onChange}
            />
          </Form.Field>
            <Form.Field>
                <Input
                    fluid
                    label="Balance"
                    type="text"
                    placeholder="balance"
                    value={accountBalance}
                    state="accountBalance"
                />
            </Form.Field>

            <Form.Field>
            <Input
                fluid
                label="Amount"
                type="number"
                state="amount"
                value={amount}
                onChange={onChangeAmount}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'center' }}>
            <TxButton
                label="Query Channel"
                type="QUERY"
                setStatus={setStatus}
                attrs={{
                  palletRpc: 'ibc',
                  callable: 'channels',
                  inputParams: [toHexStr('transfer'), toHexStr('channel-0')],
                  paramFields: [true, true],
                }}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'center' }}>
            <TxButton
                label="Submit"
                type="SIGNED-TX"
                setStatus={setStatus}
                attrs={{
                  palletRpc: 'ibc',
                  callable: 'transfer',
                  inputParams: [toHexStr('transfer'), toHexStr('channel-0'), tokenSymbol, parseInt(amount), toHexStr(addressTo), 999999, Date.now() + 999999],
                  paramFields: [true, true, true, true, true, true, true],
                }}
            />
          </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form>
      </Grid.Column>
  )
}

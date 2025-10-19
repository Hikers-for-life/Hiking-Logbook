import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

describe('UI components smoke', () => {
  test('button renders', () => {
    const Button = require('../components/ui/button').Button;
    render(<Button>Click</Button>);
  });

  test('badge renders', () => {
    const { Badge } = require('../components/ui/badge');
    render(<Badge>New</Badge>);
  });

  test('input renders', () => {
    const { Input } = require('../components/ui/input');
    render(<Input placeholder="x" />);
  });

  test('textarea renders', () => {
    const { Textarea } = require('../components/ui/textarea');
    render(<Textarea placeholder="x" />);
  });

  test('card renders', () => {
    const {
      Card,
      CardHeader,
      CardContent,
      CardTitle,
    } = require('../components/ui/card');
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    );
  });

  test('tabs renders', () => {
    const {
      Tabs,
      TabsList,
      TabsTrigger,
      TabsContent,
    } = require('../components/ui/tabs');
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
        <TabsContent value="one">One</TabsContent>
      </Tabs>
    );
  });

  test('progress renders', () => {
    const { Progress } = require('../components/ui/progress');
    render(<Progress value={50} />);
  });

  test('alert renders', () => {
    const { Alert } = require('../components/ui/alert');
    render(<Alert />);
  });

  test('label renders', () => {
    const { Label } = require('../components/ui/label');
    render(<Label htmlFor="x">Lbl</Label>);
  });
});
